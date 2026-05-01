pipeline {
    agent any
    environment {
        REGISTRY = "docker.io/reddylokesh837"
        IMAGE_NAME = "pythonlabs"
        DOCKERHUB = credentials('dockerhub-cred')     // DockerHub creds
        KUBECONFIG = credentials('kubeconfig-cred')   // kubeconfig creds
        GITHUB = credentials('github-cred')           // GitHub PAT
    }
    triggers {
        githubPush()   // Trigger on GitHub webhook push
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/reddylokesh837/python-new.git',
                    credentialsId: 'github-cred'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB) {
                        docker.image("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}").push()
                        docker.image("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}").push("latest")
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-cred']) {
                    sh """
                    kubectl set image deployment/backend backend=${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} -n default
                    kubectl set image deployment/frontend frontend=${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} -n default
                    kubectl rollout status deployment/backend -n default
                    kubectl rollout status deployment/frontend -n default
                    """
                }
            }
        }
    }
    post {
        success {
            echo "✅ Deployment successful: ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline failed. Check logs."
        }
    }
}

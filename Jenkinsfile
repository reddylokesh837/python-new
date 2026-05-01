pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
    }
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
                sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                    docker tag ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER} ${REGISTRY}/${IMAGE_NAME}:latest
                    docker push ${REGISTRY}/${IMAGE_NAME}:latest
                    """
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

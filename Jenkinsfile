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

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${REGISTRY}/pythonlabs-backend:${BUILD_NUMBER} -f docker/Dockerfile.backend ."
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build -t ${REGISTRY}/pythonlabs-frontend:${BUILD_NUMBER} -f docker/Dockerfile.frontend ."
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                                                usernameVariable: 'DOCKER_USER',
                                                passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push ${REGISTRY}/pythonlabs-backend:${BUILD_NUMBER}
                    docker push ${REGISTRY}/pythonlabs-frontend:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Apply Manifests') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-cred']) {
                    sh """
                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl apply -f k8s/backend-service.yaml
                    kubectl apply -f k8s/frontend-deployment.yaml
                    kubectl apply -f k8s/frontend-service.yaml
                    kubectl apply -f k8s/gateway.yaml
                    kubectl apply -f k8s/httproutes.yaml
                    kubectl apply -f k8s/jenkins-rbac.yaml
                    kubectl apply -k "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.0.0"
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-cred', serverUrl: 'https://127.0.0.1:49889']) {
                    sh """
                    kubectl set image deployment/backend backend=${REGISTRY}/pythonlabs-backend:${BUILD_NUMBER} -n default
                    kubectl set image deployment/frontend frontend=${REGISTRY}/pythonlabs-frontend:${BUILD_NUMBER} -n default
                    kubectl rollout status deployment/backend -n default
                    kubectl rollout status deployment/frontend -n default
                    """
                }
            }
        }
    }
    post {
        success {
            echo "✅ Deployment successful: ${REGISTRY}/pythonlabs-backend:${BUILD_NUMBER}"
            echo "✅ Deployment successful: ${REGISTRY}/pythonlabs-frontend:${BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline failed. Check logs."
        }
    }
}

// pipeline {
//     agent any

//     environment {
//         SERVICE_NAME = "frontend-angular"
//         IMAGE_NAME = "rzem/frontend-angular"
//         PROJECT_PATH = "."  // si le Jenkinsfile est à la racine du projet
//         DOCKERHUB_CREDS = credentials('dockerhub-cred')
//         KUBECONFIG = credentials('kubeconfig')
//         NO_PROXY = "192.16.0.233,localhost,127.0.0.1,.svc.cluster.local"
//         NAMESPACE = "default"
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Install Dependencies') {
//             steps {
//                 dir(PROJECT_PATH) {
//                     sh 'npm install'
//                 }
//             }
//         }

//         stage('Build Angular App') {
//             steps {
//                 dir(PROJECT_PATH) {
//                     sh 'npm run build -- --configuration production'
//                 }
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 dir(PROJECT_PATH) {
//                     sh '''
//                         docker build -t ${IMAGE_NAME}:latest .
//                     '''
//                 }
//             }
//         }

//         stage('Push Docker Image') {
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: 'dockerhub-cred',
//                     usernameVariable: 'DOCKERHUB_USER',
//                     passwordVariable: 'DOCKERHUB_PASS'
//                 )]) {
//                     sh '''
//                         echo "$DOCKERHUB_PASS" | docker login -u $DOCKERHUB_USER --password-stdin
//                         docker push ${IMAGE_NAME}:latest
//                     '''
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
//                     dir("${PROJECT_PATH}/k8s") {
//                         sh '''
//                             export no_proxy="${NO_PROXY}"
//                             kubectl --kubeconfig="$KUBECONFIG_FILE" apply -f deployment.yaml
//                             kubectl --kubeconfig="$KUBECONFIG_FILE" -n ${NAMESPACE} rollout status deployment/${SERVICE_NAME} --timeout=300s
//                         '''
//                     }
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             cleanWs()
//         }
//         success {
//             echo '✅ Build & déploiement frontend Angular réussis !'
//         }
//         failure {
//             echo '❌ Échec du pipeline frontend Angular'
//         }
//     }
// }



pipeline {
    agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  nodeSelector:
    jenkins: "worker"
  containers:
  - name: node
    image: node:18
    command: ['cat']
    tty: true
    resources:
      requests:
        memory: "350Mi"
        cpu: "250m"
      limits:
        memory: "900Mi"
        cpu: "500m"
    env:
    - name: http_proxy
      value: http://10.112.62.168:8888
    - name: https_proxy
      value: http://10.112.62.168:8888
    - name: no_proxy
      value: localhost,127.0.0.1,.svc,.cluster.local,192.168.0.0/16,10.0.0.0/8
"""
      defaultContainer 'node'
    }
  }

 
    environment {
        SERVICE_NAME = "frontend-angular"
        IMAGE_NAME = "rzem/frontend-angular"
        PROJECT_PATH = "."
        DOCKERHUB_CREDS = credentials('dockerhub-cred')
        KUBECONFIG = credentials('kubeconfig')
        NO_PROXY = "192.16.0.233,localhost,127.0.0.1,.svc.cluster.local"
        NAMESPACE = "default"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                dir(PROJECT_PATH) {
                    sh 'npm install'
                }
            }
        }

        stage('Build Angular App') {
            steps {
                dir(PROJECT_PATH) {
                    sh 'npm run build -- --configuration production'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir(PROJECT_PATH) {
                    sh 'docker build -t ${IMAGE_NAME}:latest .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_PASS" | docker login -u $DOCKERHUB_USER --password-stdin
                        docker push ${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    dir("${PROJECT_PATH}/k8s") {
                        sh '''
                            export no_proxy="${NO_PROXY}"
                            kubectl --kubeconfig="$KUBECONFIG_FILE" apply -f deployment.yaml
                            kubectl --kubeconfig="$KUBECONFIG_FILE" -n ${NAMESPACE} rollout status deployment/${SERVICE_NAME} --timeout=300s
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Build & déploiement frontend Angular réussis !'
        }
        failure {
            echo '❌ Échec du pipeline frontend Angular'
        }
    }
}

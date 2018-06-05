#!groovy

def applicationName = 'entmon-workflow-service'
def applicationPortInContainer = 8093
def dockerImageRepo = 'global-it-entmon/entmon-workflow-service'
def ucpGroupLabel = 'vault'
branch = env.BRANCH_NAME
def vaultPath = 'secret/global-it-entmon/entmon/' + branch
def dcosApplicationServicePath = 'global-it-entmon/entmon-workflow-service' 

// DC/OS environment
def dcosLoadBalancer = 'apps.dcos.hpecorp.net'
def dcosMaster = 'dashboard.dcos.hpecorp.net'

// General values
def buildImage = 'hub.docker.hpecorp.net/global-it/addison-nodejs-test:3.0.0'
def dockerRegistry = 'hub.docker.hpecorp.net'
def npmRegistry = 'https://registry.npmjs.itcs.hpecorp.net/'
def vaultUrl = 'https://dashboard.docker.hpecorp.net:8200'

// Variables used during run
def dockerImage
def dockerImageTag
def gitInfo
def secrets


def getContainerCount() {
    // Define the number of containers you want in various environments based on GitHub branch
    if (env.BRANCH_NAME.startsWith('PR-')) {
        return 1
    } else if (env.BRANCH_NAME == 'master') {
        return 4
    }

    return 2
}

def getDeploymentEnvironment() {
    if (env.BRANCH_NAME.startsWith('PR-')) {
        return 'development'
    } else if (env.BRANCH_NAME == 'master') {
        return 'production'
    }

    return env.BRANCH_NAME
}

pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr:'10'))
        timestamps()
        ansiColor('xterm')
    }
    agent {
        label 'docker-in-docker'
    }
    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
                echo 'Cleeanup done'
            }
        }  
        
        stage('Init') {
            steps {
                checkout scm
                sh 'mkdir -p ./src/config/local'
                script {
                    gitInfo = getGitInfo()
                    dockerImageTag = "${env.BRANCH_NAME}-${gitInfo.git_commit}"
                    echo "the change owner ${gitInfo.git_author} (${gitInfo.git_email})"
                }
            }
        } 
        stage('Vault') {
            steps {
                script {
                    secrets = vaultGetSecrets()
                    echo "Getting Vault Values"
                    echo secrets.username
                }
            }
        }
        
        
        stage('Build') {
            steps {
                echo "Building ${dockerImageTag}"
                script {
                    docker.image(buildImage).inside {
                        sh "npm config set registry ${npmRegistry}"
                        sh 'npm install --only-production'
                    }

                    dockerImage = docker.build "${dockerRegistry}/${dockerImageRepo}:${dockerImageTag}"
                    sh 'docker images'
                    sh 'docker ps -a'
                    echo "$dockerImage"
                    
                }
            }
        }
        
             
       
        stage('Test') {
            steps {
                script {
                    docker.image(buildImage).inside {
                        sh "npm config set registry ${npmRegistry}"
                        sh 'npm install'
                        //sh 'npm test'
                        //sh 'npm run lint'
                    }
                }
            }
        }  
        
    
        stage('Docker Publish to Registry') {
            steps {
                echo "Publishing to Docker: ${dockerRegistry}/${dockerImageRepo}:${dockerImageTag}"
                script {
                    def passwordMask = [
                        $class: 'MaskPasswordsBuildWrapper',
                        varPasswordPairs: [[
                            password: secrets.password
                        ]]
                    ]
                    echo secrets.username
                    echo secrets.password
                    wrap(passwordMask) {
                        sh "docker login --username ${secrets.username} --password \"${secrets.password}\" ${dockerRegistry}"
                        dockerImage.push();
                    }
                }
            }
        }  
        
   
       stage('Deploy to DC/OS') {
            steps {
                script {
                    def dcosHostname
                    if (env.BRANCH_NAME == 'master') {
                        dcosHostname = "${applicationName}.${dcosLoadBalancer}"
                    }
                    else {
                        def branchName = env.BRANCH_NAME.replace('_', '-').toLowerCase()
                        dcosHostname = "${applicationName}-${branchName}.${dcosLoadBalancer}"
                       dcosApplicationServicePath = "${dcosApplicationServicePath}-${branchName}"
                    }

                    // Update the number of instances in marathon.json
                    sh "sed -i 's/\"instances\":\\s*[0-9]\\+/\"instances\": ${getContainerCount()}/' marathon.json"

                    // Update the application port in marathon.json
                    sh "sed -i 's/\"containerPort\":\\s*[0-9]\\+/\"containerPort\": ${applicationPortInContainer}/' marathon.json"

                    def token = dcosGetToken("https://${dcosMaster}", "${secrets.username}", "${secrets.password}")
                    def passwordMask = [
                        $class: 'MaskPasswordsBuildWrapper',
                        varPasswordPairs: [[
                            password: token
                        ]]
                    ]

                    wrap(passwordMask) {
                        marathon(
                            credentialsId: token,
                            docker: "${dockerRegistry}/${dockerImageRepo}:${dockerImageTag}".toString(),
                            filename: 'marathon.json',
                            forceUpdate: true,
                            id: "${dcosApplicationServicePath}",
                            url: "http://${dcosMaster}:8080/",
                            labels: [
                                [name: 'HAPROXY_0_VHOST', value: "${dcosHostname}"],
                                [name: 'lastChangedBy', value: "${gitInfo.git_email}".toString()]
                            ],
                            env: [
                                [name: 'APP_ENV', value: "${getDeploymentEnvironment()}"],
                                [name: 'VAULT_ADDR', value: "${vaultUrl}"],
                                [name: 'VAULT_APPLICATION_PATH', value: "${vaultPath}/${getDeploymentEnvironment()}"],
                                [name: 'VAULT_GITHUB_TOKEN', value: secrets.token],
                                [name: 'VAULT_SKIP_VERIFY', value: '1']
                            ]
                        )
                    }

                    echo '------------------------------------------------------------------------'
                    echo '-------  SUCCESS -------------------------------------------------------'
                    echo '------------------------------------------------------------------------'
                    echo "-------  URL: https://${dcosHostname}/apidocumentation -----------------"
                    echo '------------------------------------------------------------------------'
                }
            }
        } 
    
          
       stage('Deploy to CSA') {
            steps {
                script{
                    timeout(time: 180, unit: 'SECONDS'){
                        def userInput = input(
                            id: 'userInput', message: 'Please provide CSA server credentials', parameters: [
                            [$class: 'StringParameterDefinition', defaultValue: '', description: '', name: 'User ID'],
                            [$class: 'com.michelin.cio.hudson.plugins.passwordparam.PasswordParameterDefinition', defaultValue: '', description: '', name: 'Password']
                        ])
                        def userID=userInput['User ID']
                        def pwd=userInput['Password']
                        def ansibleHostsPath="/home/addison/hosts"

                        echo "Got UID and PWD"
                        echo "User ID ${userID}"
                        echo "ansibleHostsPath is ${ansibleHostsPath}"
				         
                      def passwordMask = [
                            $class: 'MaskPasswordsBuildWrapper',
                            varPasswordPairs: [[
                                password: pwd
                            ]]
                        ] 
						
                        wrap(passwordMask){
                            sh """docker run --rm -v $WORKSPACE:/home/addison hub.docker.hpecorp.net/global-it-entmon/entmon-workflow-service:${dockerImageTag} sh -c 'ansible-playbook --verbose -vvvv /home/addison/deploy.yml -i $ansibleHostsPath -u ${userID} --extra-vars="applicationName=$applicationName applicationPortInContainer=$applicationPortInContainer dockerImageTag=$dockerImageTag ansible_ssh_pass=${pwd} env=${branch}"' """
                        }       
                        

                    }
                }
            }
        }
    } 
    
   /* post {
            success {
                logstashPush('SUCCESS')
            }
            failure {
                logstashPush('FAILURE')
            }
            unstable {
                logstashPush('UNSTABLE')
            }
            always {
                sh 'docker logout hub.docker.hpecorp.net'
                deleteDir()
            }
        }  */  
}
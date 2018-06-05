NAME="$2"
BASE=/home/redraghu/entmon-workflow-service/inventory	
DOCKER_REGISTORY=hub.docker.hpecorp.net
DOCKER_REGISTORY_ORG=global-it-entmon
DOCKER_REGISTORY_REPO=$2
HOST_PORT=$3
IMAGE_API_PORT=$3
TAG=$4

echo "Removing local  docker image $DOCKER_REGISTORY/$DOCKER_REGISTORY_ORG/$DOCKER_REGISTORY_REPO:$TAG"
echo "****************************************"
  
sudo docker rm $CONTAINER_NAME
    
sudo docker rmi -f $(docker images | grep $DOCKER_REGISTORY_REPO |awk '{print $3 }')

sudo docker rmi $DOCKER_REGISTORY/$DOCKER_REGISTORY_ORG/$DOCKER_REGISTORY_REPO:$TAG

echo "Creating a docker container from docker image $DOCKER_REGISTORY/$DOCKER_REGISTORY_ORG/$DOCKER_REGISTORY_REPO:$TAG"
echo "****************************************"

CONTAINER_NAME=$DOCKER_REGISTORY_REPO
docker rm -f `docker ps -a | grep $NAME | cut -d " " -f1`
sudo docker create --name $CONTAINER_NAME -p $HOST_PORT:$IMAGE_API_PORT -e NODE_ENV=dev-eng  $DOCKER_REGISTORY/$DOCKER_REGISTORY_ORG/$DOCKER_REGISTORY_REPO:$TAG

echo "Created container $CONTAINER_NAME "
echo "****************************************"

sudo docker start $CONTAINER_NAME   
 


    
    
    


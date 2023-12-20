DOCKER_LOGIN=
DOCKER_PASSWORD=

VERSION_API=vApi1.2.0
VERSION_HANDLER=vHandler1.1.0

docker login --username $DOCKER_LOGIN --password $DOCKER_PASSWORD

docker build -t $DOCKER_LOGIN/shmal:$VERSION_API -f ./apps/api/Dockerfile .
docker push $DOCKER_LOGIN/shmal:$VERSION_API
docker image rm $DOCKER_LOGIN/shmal:$VERSION_API

docker build -t $DOCKER_LOGIN/shmal:$VERSION_HANDLER -f ./apps/api/Dockerfile .
docker push $DOCKER_LOGIN/shmal:$VERSION_HANDLER
docker image rm $DOCKER_LOGIN/shmal:$VERSION_HANDLER
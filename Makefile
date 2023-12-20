SHELL := /bin/bash

.DEFAULT_GOAL := help

APP_NAME := labeling-api
export APP_ROOT ?= $(shell pwd)

-include $(APP_ROOT)/Makefile.override

#############################################
#             JOBS FOR CI                   #
#############################################

test:
	@echo "Running tests..."
	@yarn test

test-e2e:
	@echo "Running e2e tests..."
	@yarn test:e2e


#############################################
#             JOBS FOR LOCAL                #
#############################################

# run ci/cd

docker/up: ## Start the application.
	@docker-compose up -d
	@docker-compose logs app --follow

docker/test: ## Test the application
	@docker-compose run --rm app-test

docker/test-e2e: ## Test the application with coverage
	@docker-compose run --rm app-test-e2e

docker/stop: ## Stop the application.
	@docker-compose stop

docker/down: ## Stop and remove containers, images, and volumes.
	@docker-compose down

docker/build: ## Build the application.
	@docker-compose build

docker/restart: ## Restart the application.
	@docker-compose restart


build-and-push-prod: ## Build and push docker image for production
	@docker build $(APP_ROOT) -f $(APP_ROOT)/docker/Dockerfile.prod -t $(IMAGE_NAME)
	@docker push $(IMAGE_NAME)

update-argoconfig:
	@kubectl set image --filename k8s/dev/deployment.yaml labeling-api=$(IMAGE_NAME) --local -o yaml > new-deployment.yaml
	@cat new-deployment.yaml
	@rm -rf k8s/dev/deployment.yaml
	@mv new-deployment.yaml k8s/dev/deployment.yaml


deploy: build-and-push-prod update-argoconfig ## Deploy to kubernetes
	@echo "Completed!"

help:
	@echo -e "\n Usage: make [target]\n"
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m  %-30s\033[0m %s\n", $$1, $$2}'
	@echo -e "\n"
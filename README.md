# Sample Backend

This repository contains the codebase for the off-chain backend API for Sample API.

## Prerequisites

Make sure you've installed all of these tools in your system.

- NodeJS (Preferably v16.x)
- GNU make
- Docker
- Docker Compose
- yarn

## Setting up local environment.

Clone the repository into your local machine and get inside the folder containing this README.md.


Install all the dependencies, so that your editor can provide suggestions.

```
yarn
```

## Running Locally.

The command will ensure to setup all required dependencies and files.

```
make init
```

Adjust the variables in `Makefile.override`, if required.

Run the following command to build and run everything

```
make up
```

Everything should be up and running in ~1 minute. Access your application in localhost with port 3000.

### Extra Configuration for Uploads

Run the following commands to create necessary buckets and access policies in minio for S3 bucket.

```
make setup-minio
```

## Helpful Commands Reference

```bash

❯ make help

 Usage: make [target]

  setup-minio                    Setup minio for local development
  init                           Initialize project
  up                             Start containers
  stop                           Stop containers
  down                           Stop and remove containers, networks, images, and volumes
  build                          Build docker images for development
  config                         Show docker-compose config
  build-prod                     Build docker image for production

```

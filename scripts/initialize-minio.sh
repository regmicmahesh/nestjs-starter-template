#!/bin/bash

mc config host add minio ${MC_HOST} ${MC_ACCESS_KEY} ${MC_SECRET_KEY}

#mc mb minio/bucket-name


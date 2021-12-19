#!/bin/bash

BYTE_SIZE=$1
BATCH_SIZE=$2
KEY_COUNT=$3

# Measure performance
for i in {1..1000}; do
  node benchmark ${BYTE_SIZE} ${BATCH_SIZE} ${KEY_COUNT}
done
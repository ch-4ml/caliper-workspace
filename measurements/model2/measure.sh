#!/bin/bash

# Measure performance
for BATCH_SIZE in 50 100 500; do
  for KEY_COUNT in 50 100 500; do
    for i in {1..100}; do
      node benchmark ${BATCH_SIZE} ${KEY_COUNT}
    done
  done
done
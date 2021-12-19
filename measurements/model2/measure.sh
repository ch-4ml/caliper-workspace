#!/bin/bash

# Initialize
rm ttp.json avg.json
echo "{}" > ttp.json
echo "{}" > avg.json

# Measure performance
for BYTE_SIZE in 50 100 500; do
  for BATCH_SIZE in 50 100 500; do
    for KEY_COUNT in 50 100 500; do
      for i in {1..1000}; do
        node benchmark ${BYTE_SIZE} ${BATCH_SIZE} ${KEY_COUNT}
      done
    done
  done
done

# Get average
node benchmark-avg
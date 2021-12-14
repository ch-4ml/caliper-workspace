#!/bin/bash

# Initialize
rm dup.json tts.json ttu.json avg.json
echo "{}" > dup.json
echo "{}" > tts.json
echo "{}" > ttu.json
echo "{}" > avg.json

# Measure performance
for BATCH_SIZE in 50 100 500; do
  for KEY_COUNT in 50 100 500; do
    for i in {1..100}; do
      node benchmark ${BATCH_SIZE} ${KEY_COUNT}
    done
  done
done

# Get average
node benchmark-avg
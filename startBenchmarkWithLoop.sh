#!/bin/bash

for BYTE_SIZE in 10 50 100 500 1000
do
  for BATCH_SIZE in 10 50 100 500 1000
  do
    for KEY_COUNT in 10 50 100 500 1000
    do
      ./startBenchmark.sh ${BYTE_SIZE} ${BATCH_SIZE} ${KEY_COUNT}
    done
  done
done
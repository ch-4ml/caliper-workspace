#!/bin/bash

for BATCH_SIZE in 50 100 500
do
  for BYTE_SIZE in 50 100 500
  do
    for KEY_COUNT in 50 100 500
    do
      ./startTransmissionBenchmark.sh ${BYTE_SIZE} ${BATCH_SIZE} ${KEY_COUNT}
    done
  done
done
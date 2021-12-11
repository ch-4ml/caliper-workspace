#!/bin/bash

# $1: Byte Size
# $2: Batch Size
# $3: Key Count

if [ $# -ne 3 ]; then
  echo "Wrong arguments. expected 3 (Model Number, Byte Size, Batch Size, Key Count)"
  exit 0
fi

# if [ $1 -eq 1 ]; then
#   WORKLOAD_MODULE=
# elif [ $1 -eq 2]; then

# else 

# fi



# # Network up
pushd /home/bstudent/dev/hyperledger-fabric-performance-improvement/application
./startFabric.sh
popd

# # Replace client's private key
cp networks/networkConfigTemplate.yaml networks/networkConfig.yaml

for org in 1 2 3; do
  CLIENT_PRIVATE_KEY=$(ls /home/bstudent/dev/hyperledger-fabric-performance-improvement/network/organizations/peerOrganizations/org${org}.example.com/users/User1@org${org}.example.com/msp/keystore/)
  
  echo "Org${org}: ${CLIENT_PRIVATE_KEY}"

  sed -i "s/ORG${org}_CLIENT_PRIVATE_KEY/${CLIENT_PRIVATE_KEY}/g" networks/networkConfig.yaml
done

# Replace arguments for benchmark configuration
cp benchmarks/myAssetBenchmarkTemplate.yaml benchmarks/myAssetBenchmark.yaml

sed -i "s/BYTE_SIZE/$1/g" benchmarks/myAssetBenchmark.yaml
sed -i "s/BATCH_SIZE/$2/g" benchmarks/myAssetBenchmark.yaml
sed -i "s/KEY_COUNT/$3/g" benchmarks/myAssetBenchmark.yaml

# Run benchmark
npx caliper launch manager --caliper-workspace . --caliper-networkconfig networks/networkConfig.yaml --caliper-benchconfig benchmarks/myAssetBenchmark.yaml --caliper-flow-only-test --caliper-fabric-gateway-enabled

# Rename report file
mv report.html report/views/report-$1-$2-$3.html
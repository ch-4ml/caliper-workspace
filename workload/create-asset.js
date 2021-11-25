/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Investigate submitTransaction() using network model to create an asset of specific size in the registry
// - label: create-asset-100
//     chaincodeID: fixed-asset
//     txNumber:
//     - 1000
//     rateControl:
//     - type: fixed-rate
//       opts:
//         tps: 50
//     arguments:
//       chaincodeID: fixed-asset | fixed-asset-base
//       byteSize: 100
//     callback: benchmark/network-model/lib/create-asset.js

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class CreateAssetWorkload extends WorkloadModuleBase {
  /**
   * Initializes the workload module instance.
   */
  constructor() {
    super();
    this.txIndex = 0;
  }

  /**
   * Initialize the workload module with the given parameters.
   * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
   * @param {number} totalWorkers The total number of workers participating in the round.
   * @param {number} roundIndex The 0-based index of the currently executing round.
   * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
   * @param {BlockchainInterface} sutAdapter The adapter of the underlying SUT.
   * @param {Object} sutContext The custom context object provided by the SUT adapter.
   * @async
   */
  async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
    await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

    this.args = this.roundArguments;
    this.chaincodeID = this.args.chaincodeID ? this.args.chaincodeID : 'fixed-asset';
    this.byteSize = this.args.byteSize;

    this.asset = {
      docType: this.chaincodeID,
      content: '',
      creator: 'client' + this.workerIndex,
      bytesize: this.byteSize
    };

    const content = 'content';
    let idx = 0;
    while (bytes(JSON.stringify(this.asset)) < this.byteSize) {
      const letter = content.charAt(idx);
      idx = idx >= content.length ? 0 : idx + 1;
      this.asset.content = this.asset.content + letter;
    }
  }

  /**
   * Assemble TXs for the round.
   * @return {Promise<TxStatus[]>}
   */
  async submitTransaction() {
    const uuid = `client${this.workerIndex}_${this.byteSize}_${this.txIndex}`;
    this.asset.uuid = uuid;
    this.txIndex++;
    const request = {
      contractId: this.chaincodeID,
      contractFunction: 'createAsset',
      invokeIdentity: 'User1',
      contractArguments: [uuid, JSON.stringify(this.asset)],
      readOnly: false
    };

    await this.sutAdapter.sendRequests(request);
  }

  async cleanupWorkloadModule() {
    for (let i = 0; i < this.txIndex; i++) {
      const assetID = `client${this.workerIndex}_${this.byteSize}_${i}`;
      console.log(`Worker ${this.workerIndex}: Deleting asset ${assetID}`);
      const request = {
        contractId: this.roundArguments.contractId,
        contractFunction: 'DeleteAsset',
        invokerIdentity: 'User1',
        contractArguments: [assetID],
        readonly: false
      };

      await this.sutAdapter.sendRequests(request);
    }
  }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
  return new CreateAssetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

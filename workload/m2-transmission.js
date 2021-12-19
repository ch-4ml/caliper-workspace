'use strict';

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
    await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

    this.args = this.roundArguments;
    this.contractId = this.args.contractId ? this.args.contractId : 'fixed-asset';
    this.byteSize = this.args.byteSize ? parseInt(this.args.byteSize) : 100;
    this.batchSize = this.args.batchSize ? parseInt(this.args.batchSize) : 1;
    this.keyCount = this.args.keyCount ? parseInt(this.args.keyCount) : 1;

    this.asset = {
      docType: this.contractId,
      content: '',
      creator: 'client' + this.workerIndex,
      bytesize: this.byteSize
    };

    const content = 'content';
    let idx = 0;
    while (bytes(JSON.stringify(this.asset.content)) < this.byteSize) {
      const letter = content.charAt(idx);
      idx = idx >= content.length ? 0 : idx + 1;
      this.asset.content = this.asset.content + letter;
    }
  }

  async submitTransaction() {
    const batch = [];
    for (let i = 0; i < this.batchSize; i++) {
      const index = i >= this.keyCount ? i % this.keyCount : i;
      this.asset.uuid = `client${this.workerIndex}_${this.byteSize}_${index + this.roundIndex * this.keyCount}`;
      const batchAsset = JSON.parse(JSON.stringify(this.asset));
      batch.push(batchAsset);
    }

    const request = {
      contractId: this.roundArguments.contractId,
      contractFunction: 'MeasureTrasmissionTime',
      invokeIdentity: 'User1',
      contractArguments: [JSON.stringify(batch)],
      readonly: true
    };

    await this.sutAdapter.sendRequests(request);
  }

  async cleanupWorkloadModule() {}
}

function createWorkloadModule() {
  return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

'use strict';

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
  constructor() {
    super();
    this.txIndex = 0;
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
      contentHistories: [],
      creator: 'client' + this.workerIndex,
      bytesize: this.byteSize
    };

    const batch = [];

    for (let i = 0; i < this.batchSize; i++) {
      this.asset.content = '';

      const content = 'content';
      while (bytes(JSON.stringify(this.asset.content)) < this.byteSize) {
        const letter = content.charAt(idx);
        idx = idx >= content.length ? 0 : idx + 1;
        this.asset.content = this.asset.content + letter;
      }

      const randomID = Math.floor(Math.random() * this.keyCount);

      this.asset.uuid = `client${this.workerIndex}_${this.byteSize}_${randomID}`;
      const existDataIndex = batch.findIndex((b) => {
        // console.log(b.uuid, this.asset.uuid);
        return b.uuid === this.asset.uuid;
      });

      // console.log(existDataIndex);

      if (existDataIndex > -1) batch[existDataIndex].content += ' ' + this.asset.content;
      else {
        const batchAsset = JSON.parse(JSON.stringify(this.asset));
        batch.push(batchAsset);
      }
    }

    for (let i = 0; i < this.keyCount; i++) {
      console.log(`worker: ${this.workerIndex}`);
      console.log(`length${i}: ${JSON.stringify(batch[i].content)}`);
      // console.log(`contentHistories${i}: ${JSON.stringify(batch[i].contentHistories)}`);
    }

    // FIXME: CreateAssetsWithContentHistoriesFromBatch 맞게 변경
    const request = {
      contractId: this.roundArguments.contractId,
      contractFunction: 'CreateAssetsFromBatch',
      invokeIdentity: 'User1',
      contractArguments: [JSON.stringify(batch)],
      readonly: false
    };

    await this.sutAdapter.sendRequests(request);
  }

  async submitTransaction() {
    this.asset.uuid = `client${this.workerIndex}_${this.byteSize}_${this.txIndex}`;

    this.txIndex++;

    const request = {
      contractId: this.roundArguments.contractId,
      contractFunction: 'GetHistoryForUUID',
      invokeIdentity: 'User1',
      contractArguments: [this.asset.uuid],
      readonly: true
    };

    const response = await this.sutAdapter.sendRequests(request);
    const res = JSON.parse(response.status.result.toString());
    const results = res.Results;
    for (const result of results) {
      if (result && result.value) {
        // console.log(Buffer.from(result.value, 'base64').toString('utf8'));
        // console.log('==========');
      }
    }
  }

  async cleanupWorkloadModule() {
    for (let i = 0; i < this.keyCount; i++) {
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

function createWorkloadModule() {
  return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

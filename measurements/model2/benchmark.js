const fs = require('fs');
const { hrtime } = require('process');

const NS_PER_SEC = 1e9;

if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
  console.log(`Expected 2 arguments. ex) node benchmark [byteSize] [BATCH_SIZE] [KEY_COUNT]`);
  process.exit(1);
}

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};

try {
  // Declare path
  const ttpFilePath = './ttp.json';

  // Read json file
  const ttpFile = fs.readFileSync(ttpFilePath, 'utf8');

  // Convert json to object
  let ttp = JSON.parse(ttpFile);

  const byteSize = process.argv[2];
  const batchSize = process.argv[3];
  const keyCount = process.argv[4];

  // Declare function
  const work = (batchSize, keyCount) => {
    let ttpResult = 0;

    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      // Dummy
      const asset = {
        docType: 'docType',
        content: '',
        creator: 'client1',
        bytesize: byteSize
      };

      const content = 'content';
      let idx = 0;
      while (bytes(JSON.stringify(asset.content)) < byteSize) {
        const letter = content.charAt(idx);
        idx = idx >= content.length ? 0 : idx + 1;
        asset.content = asset.content + letter;
      }

      asset.index = i >= keyCount ? i % keyCount : i;

      const sPushTime = hrtime();
      batch.push(asset);
      const fPushTime = hrtime(sPushTime)[1];
      ttpResult += fPushTime / NS_PER_SEC;
    }

    // 총 시간
    ttpResult = ttpResult.toFixed(8);

    const key = `byteSize${byteSize}-batchSize${batchSize}-keyCount${keyCount}`;

    if (ttp[key] && ttp[key].length > 0) ttp[key].push(ttpResult);
    else ttp[key] = [ttpResult];

    fs.writeFileSync(ttpFilePath, JSON.stringify(ttp));
  };

  work(batchSize, keyCount);
} catch (err) {
  console.log(err);
}

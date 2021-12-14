const fs = require('fs');
const { hrtime } = require('process');

const BYTE_SIZE = 100;
const NS_PER_SEC = 1e9;

if (!process.argv[2] || !process.argv[3]) {
  console.log(`Expected 2 arguments. ex) node benchmark [BATCH_SIZE] [KEY_COUNT]`);
  process.exit(1);
}

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};

try {
  // Declare path
  const dupFilePath = './dup.json';
  const ttsFilePath = './tts.json';
  const ttuFilePath = './ttu.json';

  // Read json file
  const dupFile = fs.readFileSync(dupFilePath, 'utf8');
  const ttsFile = fs.readFileSync(ttsFilePath, 'utf8');
  const ttuFile = fs.readFileSync(ttuFilePath, 'utf8');

  // Convert json to object
  let dup = JSON.parse(dupFile);
  let tts = JSON.parse(ttsFile);
  let ttu = JSON.parse(ttuFile);

  const batchSize = process.argv[2];
  const keyCount = process.argv[3];

  // Declare function
  const work = (batchSize, keyCount) => {
    let dupResult = 0;
    let ttsResult = 0;
    let ttuResult = 0;

    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      // Dummy
      const asset = {
        docType: 'docType',
        content: '',
        creator: 'client1',
        bytesize: BYTE_SIZE
      };

      const content = 'content';
      let idx = 0;
      while (bytes(JSON.stringify(asset.content)) < BYTE_SIZE) {
        const letter = content.charAt(idx);
        idx = idx >= content.length ? 0 : idx + 1;
        asset.content = asset.content + letter;
      }

      const randomIdx = Math.floor(Math.random() * keyCount);
      asset.index = randomIdx;

      const sSearchTime = hrtime();
      const foundIndex = batch.findIndex((b) => b.index === randomIdx);
      const fSearchTime = hrtime(sSearchTime)[1];
      ttsResult += fSearchTime / NS_PER_SEC;

      const sUpdateTime = hrtime();
      if (foundIndex > -1) {
        dupResult += 1;
        batch[foundIndex].content += ` ${asset.content}`;
      } else {
        batch.push(asset);
      }
      const fUpdateTime = hrtime(sUpdateTime)[1];
      ttuResult += fUpdateTime / NS_PER_SEC;
    }

    // 총 시간
    ttsResult = ttsResult.toFixed(8);
    ttuResult = ttuResult.toFixed(8);

    const key = `batchSize${batchSize}-keyCount${keyCount}`;

    if (dup[key] && dup[key].length > 0) dup[key].push(dupResult);
    else dup[key] = [dupResult];

    if (tts[key] && tts[key].length > 0) tts[key].push(ttsResult);
    else tts[key] = [ttsResult];

    if (ttu[key] && ttu[key].length > 0) ttu[key].push(ttuResult);
    else ttu[key] = [ttuResult];

    fs.writeFileSync(dupFilePath, JSON.stringify(dup));
    fs.writeFileSync(ttsFilePath, JSON.stringify(tts));
    fs.writeFileSync(ttuFilePath, JSON.stringify(ttu));
  };

  work(batchSize, keyCount);
} catch (err) {
  console.log(err);
}

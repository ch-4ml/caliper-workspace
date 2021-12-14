const fs = require('fs');
const { hrtime } = require('process');

const BYTE_SIZE = 100;
const NS_PER_SEC = 1e9;

if (!process.argv[2] || !process.argv[3]) {
  console.log(`Expected 2 arguments. ex) node probability-of-duplication [BATCH_SIZE] [KEY_COUNT]`);
  process.exit(1);
}

const bytes = (s) => {
  return ~-encodeURI(s).split(/%..|./).length;
};

try {
  // Declare path
  const probabilityFilePath = './probability-of-duplication.json';
  const ttpFilePath = './time-to-push.json';
  const ttsFilePath = './time-to-search.json';
  const ttuFilePath = './time-to-update.json';

  // Read json file
  const probabilityFile = fs.readFileSync(probabilityFilePath, 'utf8');
  const ttpFile = fs.readFileSync(ttpFilePath, 'utf8');
  const ttsFile = fs.readFileSync(ttsFilePath, 'utf8');
  const ttuFile = fs.readFileSync(ttuFilePath, 'utf8');

  // Convert json to object
  let prob = JSON.parse(probabilityFile);
  let ttp = JSON.parse(ttpFile);
  let tts = JSON.parse(ttsFile);
  let ttu = JSON.parse(ttuFile);

  const batchSize = process.argv[2];
  const keyCount = process.argv[3];

  // Declare function
  const work = (batchSize, keyCount) => {
    const probResult = [];
    const ttpResult = [];
    const ttsResult = [];
    const ttuResult = [];

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
      ttsResult.push((fSearchTime / NS_PER_SEC).toFixed(8));

      if (foundIndex > -1) {
        probResult.push(1);
        const sUpdateTime = hrtime();
        batch[foundIndex].content += ` ${asset.content}`;
        const fUpdateTIme = hrtime(sUpdateTime)[1];
        ttuResult.push((fUpdateTIme / NS_PER_SEC).toFixed(8));
      } else {
        probResult.push(0);
        const sPushTime = hrtime();
        batch.push(asset);
        const fPushTime = hrtime(sPushTime)[1];
        ttpResult.push((fPushTime / NS_PER_SEC).toFixed(8));
      }
    }

    const key = `batchSize${batchSize}-keyCount${keyCount}`;

    if (prob[key] && prob[key].length > 0) prob[key].push(probResult);
    else prob[key] = [probResult];

    if (ttp[key] && ttp[key].length > 0) ttp[key].push(ttpResult);
    else ttp[key] = [ttpResult];

    if (tts[key] && tts[key].length > 0) tts[key].push(ttsResult);
    else tts[key] = [ttsResult];

    if (ttu[key] && ttu[key].length > 0) ttu[key].push(ttuResult);
    else ttu[key] = [ttuResult];

    fs.writeFileSync(probabilityFilePath, JSON.stringify(prob));
    fs.writeFileSync(ttpFilePath, JSON.stringify(ttp));
    fs.writeFileSync(ttsFilePath, JSON.stringify(tts));
    fs.writeFileSync(ttuFilePath, JSON.stringify(ttu));
  };

  work(batchSize, keyCount);
} catch (err) {
  console.log(err);
}

const fs = require('fs');

const BYTE_SIZE = 100;

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
  const probabilityJSON = JSON.parse(probabilityFile);
  const ttpJSON = JSON.parse(ttpFile);
  const ttsJSON = JSON.parse(ttsFile);
  const ttuJSON = JSON.parse(ttuFile);

  const batchSize = process.argv[2];
  const keyCount = process.argv[3];

  // Declare object of result for this round
  let prob = probabilityJSON[`${batchSize}-${keyCount}`];
  let ttp = ttpJSON[`${batchSize}-${keyCount}`];
  let tts = ttsJSON[`${batchSize}-${keyCount}`];
  let ttu = ttuJSON[`${batchSize}-${keyCount}`];

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

      const sSearchTime = new Date();
      const foundIndex = batch.findIndex((b) => b.index === randomIdx);
      const fSearchTime = new Date();
      ttsResult.push(fSearchTime.getMilliseconds() - sSearchTime.getMilliseconds());

      if (foundIndex > -1) {
        probResult.push(1);
        const sUpdateTime = new Date();
        batch[foundIndex].content += ` ${asset.content}`;
        const fUpdateTIme = new Date();
        ttuResult.push(fUpdateTIme.getMilliseconds() - sUpdateTime.getMilliseconds());
      } else {
        probResult.push(0);
        const sPushTime = new Date();
        batch.push(asset);
        const fPushTime = new Date();
        ttpResult.push(fPushTime.getMilliseconds() - sPushTime.getMilliseconds());
      }
    }

    if (prob) prob.push(probResult);
    else prob = [probResult];

    if (ttp) ttp.push(ttpResult);
    else ttp = [ttpResult];

    if (tts) tts.push(ttsResult);
    else tts = [ttsResult];

    if (ttu) ttu.push(ttuResult);
    else ttu = [ttuResult];

    fs.writeFileSync(probabilityFilePath, JSON.stringify(prob));
    fs.writeFileSync(ttpFilePath, JSON.stringify(ttp));
    fs.writeFileSync(ttsFilePath, JSON.stringify(tts));
    fs.writeFileSync(ttuFilePath, JSON.stringify(ttu));
  };

  work(batchSize, keyCount);
} catch (err) {
  console.log(err);
}

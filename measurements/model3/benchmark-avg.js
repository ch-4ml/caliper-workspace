const fs = require('fs');

try {
  // Declare path
  const dupFilePath = './dup.json';
  const ttsFilePath = './tts.json';
  const ttuFilePath = './ttu.json';
  const avgFilePath = './avg.json';

  // Read json file
  const dupFile = fs.readFileSync(dupFilePath, 'utf8');
  const ttsFile = fs.readFileSync(ttsFilePath, 'utf8');
  const ttuFile = fs.readFileSync(ttuFilePath, 'utf8');
  const avgFile = fs.readFileSync(avgFilePath, 'utf8');

  // Convert json to object
  let dup = JSON.parse(dupFile);
  let tts = JSON.parse(ttsFile);
  let ttu = JSON.parse(ttuFile);
  let avg = JSON.parse(avgFile);

  const range = [50, 100, 500];

  avg.dup = {};
  avg.tts = {};
  avg.ttu = {};

  for (let batchSize of range) {
    for (let keyCount of range) {
      const key = `batchSize${batchSize}-keyCount${keyCount}`;
      avg.dup[key] = (dup[key].reduce((acc, cur) => acc + cur) / 100).toFixed(0);
      avg.tts[key] = (tts[key].reduce((acc, cur) => parseFloat(acc) + parseFloat(cur)) / 100).toFixed(8);
      avg.ttu[key] = (ttu[key].reduce((acc, cur) => parseFloat(acc) + parseFloat(cur)) / 100).toFixed(8);
    }
  }

  fs.writeFileSync(avgFilePath, JSON.stringify(avg));
} catch (err) {
  console.log(err);
}

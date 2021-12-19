const fs = require('fs');
const range = [50, 100, 500];

try {
  // Declare path
  const ttpFilePath = './ttp.json';
  const avgFilePath = './avg.json';

  // Read json file
  const ttpFile = fs.readFileSync(ttpFilePath, 'utf8');
  const avgFile = fs.readFileSync(avgFilePath, 'utf8');

  // Convert json to object
  let ttp = JSON.parse(ttpFile);
  let avg = JSON.parse(avgFile);

  avg.ttp = {};

  for (let byteSize of range) {
    for (let batchSize of range) {
      for (let keyCount of range) {
        const key = `byteSize${byteSize}-batchSize${batchSize}-keyCount${keyCount}`;
        avg.ttp[key] = (ttp[key].reduce((acc, cur) => parseFloat(acc) + parseFloat(cur)) / 1000).toFixed(8);
      }
    }
  }

  fs.writeFileSync(avgFilePath, JSON.stringify(avg));
} catch (err) {
  console.log(err);
}

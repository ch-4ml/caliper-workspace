var express = require('express');
var router = express.Router();

// tx 수를 모두 1000개로 통일하였음 (배치 고려)
router.get('/:page', (req, res) => {
  console.log('hey');
  const page = req.params.page;
  res.render(`fix/report-${page}.html`);
});

module.exports = router;

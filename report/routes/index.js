var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// 올바른 방식
router.get('/:page', (req, res) => {
  const page = req.params.page;
  res.render(`report-${page}.html`);
});

module.exports = router;

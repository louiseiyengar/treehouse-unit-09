const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
  res.status(200).json({show: 'usersList'});
});

router.post('/', (req, res) => {
  res.status(201).location('/').end();
});

module.exports = router;
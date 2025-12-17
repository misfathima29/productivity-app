const express = require('express');
const router = express.Router();

// Route 1: Simple hello
router.get('/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Productivity Hub API!',
    timestamp: new Date().toISOString(),
    status: 'working'
  });
});

// Route 2: Math example
router.get('/math/:num1/:num2', (req, res) => {
  const num1 = parseFloat(req.params.num1);
  const num2 = parseFloat(req.params.num2);
  
  res.json({
    operation: 'Addition',
    num1: num1,
    num2: num2,
    result: num1 + num2,
    message: `${num1} + ${num2} = ${num1 + num2}`
  });
});

// Route 3: Echo what you send (POST)
router.post('/echo', (req, res) => {
  const data = req.body;
  res.json({
    received: data,
    message: 'I received your data!',
    serverTime: new Date().toISOString(),
    yourData: `You sent: ${JSON.stringify(data)}`
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { logUserLogin } = require('../controllers/loggingcontroller');

router.post("/",logUserLogin);


module.exports = router;
const express = require('express');
const router = express.Router();
const { logUserLogin } = require('../controllers/loggingcontroller');

router.post("/",logUserLogin);
( async (req, res) => {
    res.json({ message: "Login route working!" });
});

module.exports = router;
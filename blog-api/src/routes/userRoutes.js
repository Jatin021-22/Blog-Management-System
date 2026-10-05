const express = require('express');
const auth = require('../middleware/auth');
const { me } = require('../controllers/userController');

const router = express.Router();

router.get('/me', auth, me);

module.exports = router;

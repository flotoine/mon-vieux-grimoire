const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/bookControllers')
const Book = require('../models/book');

router.get('/', bookCtrl.getAllBooks);

module.exports = router;
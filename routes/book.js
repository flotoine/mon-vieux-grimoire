const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth') //ajouter auth aux routes qui ont besoin

const bookCtrl = require('../controllers/book')


router.get('/', bookCtrl.getAllBooks);

module.exports = router;
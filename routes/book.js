const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth') //ajouter auth aux routes qui ont besoin
const multer = require('../middleware/sharp-multer-config')

const bookCtrl = require('../controllers/book')

 /// ajout auth plus tard lorsque demandé
router.get('/bestrating', bookCtrl.getBestBooks);
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);

router.post('/', auth, multer, bookCtrl.addBook);
router.put('/:id',auth, multer, bookCtrl.editBook); 
router.delete('/:id',auth, multer, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);


module.exports = router;
const Book = require('../models/book');

exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
  .then(book => res.status(200).json(book))
  .catch(error => res.status(400).json({ error }));
}

exports.getBestBooks = (req, res, next) => {
  
}

exports.addBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  const book = new Book ({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })

  book.save()
    .then(() => res.status(201).json({message: "Livre enregistré !"}))
    .catch(error => res.status(400).json({error}))
}

exports.editBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id },{...req.body, _id: req.params.id })
    .then(() => res.status(200).json({message: "Livre modifié !"}))
    .catch(error => res.status(400).json({error}))
}

exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({message: "Livre supprimé !"}))
    .catch(error => res.status(400).json({error}))
}

/*
exports.rateBook = (req, res, next) => {
  Book.addOne({ _id: req.params.id }, {})
    .then(() => res.status(200).json({message: "Livre noté !"}))
    .catch(error => res.status(400).json({error}))
} */
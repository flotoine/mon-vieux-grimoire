const { query } = require('express');
const Book = require('../models/book');
const fs = require('fs');


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
  Book.aggregate( [
    {
       $setWindowFields: {
          partitionBy: "$averageRating",
          sortBy: { averageRating: -1 },
          output: {
             rankQuantityForAverageRating: {
                $rank: {}
             }
          }
       }
    },
    { $limit : 3 }
 ] )
 .then((book) => res.status(200).json(book))
 .catch(error => res.status(400).json({ error }));

}

exports.addBook = (req, res, next) => {

    const bookObject = JSON.parse(req.body.book);
    const book = new Book ({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
/// Supprime l'image dans le dossier si userIds livre ajouté et connexion ne correspondent pas
    if (book.userId != req.auth.userId) {
      const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,(err) => {
                  if (err) throw err
                  else (console.log('Fichier image supprimé'))
                })
      res.status(401).json({ message : 'Not authorized'}) // ???
    } else {
    book.save()
      .then(() => res.status(201).json({message: "Livre enregistré !"}))
      .catch(error => res.status(400).json({error}))
    }
}


exports.editBook = (req, res, next) => {
  const bookObject = req.file ? {    
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };


  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message : 'Not authorized'});
          } else {
              if (JSON.stringify(bookObject).includes('imageUrl')) {//si image présente, boucle de suppression du fichier
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,(err) => {
                  if (err) throw err
                  else (console.log('Fichier image supprimé'))
                });
              } else {/*aucune intervention fichier image*/}
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(204).json({message : 'Livre modifié!'}))
              .catch(error => res.status(400).json({ error }));
          }
      })
      .catch((error) => {
          res.status(500).json({ error });
      });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Non autorisé'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(204).json({message: 'Livre supprimé !'})})
                      .catch(error => res.status(400).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};


exports.rateBook = (req, res, next) => {
  const bookRating = req.body
  
   Book.findOneAndUpdate(  
      { _id: req.params.id, ratings: { $nin: new RegExp('^' +bookRating.userId + '$', 'i') }},
      //recherche livre par id_ et vérifie qu'il ne contient déjà pas la note de l'utilisateur connecté
        { 
          $push: { ratings: { 
            userId : bookRating.userId,
            grade : bookRating.rating
            }}
        },
        { new: true }

    )
  
  .then(() => Book.findOneAndUpdate(
        { _id: req.params.id },
        [{ 
          $set: { averageRating : {$trunc : [{ $avg: "$ratings.grade"}, 1]}}//tronque à 1 décimale
        }],
        { new: true }
  )
    .then((book) => res.status(200).json(book))
    .catch(err => res.status(400).json({err}))
)
  .catch(err => res.status(500).json({err}))

}
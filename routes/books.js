const express = require('express')
const router = express.Router()
const multer = require('multer')
const Book = require('../models/book')
const Author = require('../models/author')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

// All Books Route

router.get('/', async (req, res) => {
  res.send('All Books');
})

// New Book Route

router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route

router.post('/', upload.single('cover'), async (req, res) => {
  console.log("Received request:", req.body);
  const fileName = req.file != null ? req.file.filename : null
  console.log('Uploaded file',fileName);
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })

  try {
    const newBook = await book.save()
    // res.redirect('books/${newBook.id}') 
    res.redirect('books');
  } catch(error) {
    console.log(error);

    if(book.coverImageName != null){
      removeBookCover(book.coverImageName)
    }
    renderNewPage(res, book, true)
  }
})

function removeBookCover(fileName){
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }

    if (hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}
module.exports = router
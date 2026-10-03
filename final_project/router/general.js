const express = require('express');
const axios = require('axios');

const public_users = express.Router();

const DATA_URL = process.env.BOOK_DATA_URL || 'http://localhost:5000/api/books-data';

// Get the book list available in the shop.
// Axios + async/await is intentionally used here as required by the assignment.
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(DATA_URL);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get book details based on ISBN.
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(DATA_URL);
    const book = response.data[String(req.params.isbn)];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({
      [req.params.isbn]: book
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve book' });
  }
});

// Get all books based on author.
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(DATA_URL);
    const requestedAuthor = decodeURIComponent(req.params.author).toLowerCase();

    const matches = Object.entries(response.data).filter(
      ([, book]) => book.author.toLowerCase() === requestedAuthor
    );

    const result = {};
    for (const [isbn, book] of matches) {
      result[isbn] = book;
    }

    if (matches.length === 0) {
      return res.status(404).json({ message: 'No books found for this author' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get all books based on title.
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(DATA_URL);
    const requestedTitle = decodeURIComponent(req.params.title).toLowerCase();

    const matches = Object.entries(response.data).filter(
      ([, book]) => book.title.toLowerCase() === requestedTitle
    );

    const result = {};
    for (const [isbn, book] of matches) {
      result[isbn] = book;
    }

    if (matches.length === 0) {
      return res.status(404).json({ message: 'No books found for this title' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get book review.
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const response = await axios.get(DATA_URL);
    const book = response.data[String(req.params.isbn)];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve review' });
  }
});

module.exports.general = public_users;

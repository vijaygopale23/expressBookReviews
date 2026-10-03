const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const JWT_SECRET = 'fingerprint_customer';

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Register a new user.
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User registered successfully',
    username
  });
});

// Login: only registered users can login.
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });

  return res.status(200).json({
    message: 'Login successful',
    username,
    token
  });
});

// Add/update a book review. Authentication is handled in index.js.
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = String(req.params.isbn);
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!review || typeof review !== 'string') {
    return res.status(400).json({ message: 'Review is required' });
  }

  const username = req.user;
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added/updated successfully',
    isbn,
    username,
    review
  });
});

// Delete a user's own review.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = String(req.params.isbn);

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const username = req.user;

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({ message: 'Review not found' });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully',
    isbn,
    username
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;

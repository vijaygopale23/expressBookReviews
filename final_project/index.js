const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const books = require('./router/booksdb.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;
const JWT_SECRET = 'fingerprint_customer';

app.use(express.json());

app.use(
  '/customer',
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// Internal data endpoint used by general.js with Axios.
// It is not one of the public assignment endpoints.
app.get('/api/books-data', (req, res) => {
  res.json(books);
});

// JWT authentication for protected review routes.
app.use('/customer/auth/*', (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

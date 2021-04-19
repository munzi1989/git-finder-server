const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csurf = require('csurf')

// init express
const app = express();
// connectdb
connectDB();

app.use(cors());
app.use(cookieParser())

const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

app.use(express.json({ extended: false }));

// send csrf token upon get request 
app.get('/csrf-token', (req, res) => {
  res.json({csrfToken: req.csrfToken()})
})
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/repos', require('./routes/repos'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SUCCESS! Server running on port:${PORT}`);
});

const express = require('express');

const app = express();

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SUCCESS! Server running on port:${PORT}`);
});
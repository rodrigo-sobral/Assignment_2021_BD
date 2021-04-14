const express = require('express');
const app = express();
const PORT= 8080

app.use(express.json());
app.use('/', require('./route/Route'));

app.listen(PORT, () => console.log(`Its alive on http://localhost:${PORT}!`));
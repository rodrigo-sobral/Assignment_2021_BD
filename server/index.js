const express = require('express');
const app = express();
const PORT= 8080

app.use(express.json());
app.use('/', require('./route/Route'));
app.use(function (error, req, res, next) {
	if (error.message === 'Esse Username ja foi registado') {
		return res.status(409).send({erro: error.message});
	} else if (error.message === 'Esse Email ja foi registado') {
		return res.status(409).send({erro: error.message});
	}
	else res.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`Its alive on http://localhost:${PORT}`));

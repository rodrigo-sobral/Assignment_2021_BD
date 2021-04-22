const express = require('express');
const app = express();
const PORT= 8080

app.use(express.json());
app.use('/', require('./route/Route'));

//	HERE ARE THE ERRORS RELATED TO SERVICE LAYER
app.use(function (error, req, res, next) {
	if (error.message === 'Esse Username ja foi registado' || error.message === 'Esse Email ja foi registado' || error.message === 'Utilizador ou palavra-chave invalidos. Por favor, tente novamente.') {
		return res.status(409).send({erro: error.message});
	}
	else if (error.message === 'Esse Artigo nao esta registado' || error.message === 'Esse Username nao esta registado' || error.message === 'Esse Artigo ja se encontra a ser leiloado' || error.message === 'Inseriu um formato de Data invalido') {
		return res.status(409).send({erro: error.message});
	}
	else res.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`Its alive on http://localhost:${PORT}`));

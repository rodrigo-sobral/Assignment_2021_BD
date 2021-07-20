const express = require('express');
const app = express();
const PORT= 8080
const cors = require('cors');
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use('/', require('./route/Route'));
//	HERE ARE THE ERRORS RELATED TO SERVICE LAYER
app.use(function (error, req, res, next) {
	if (error.message === 'Esse Username ja foi registado' || error.message === 'Esse Email ja foi registado') {
		return res.status(500).json({erro: error.message});
	} 
	
	//	BAD REQUEST
	else if (error.message === 'leilaoId Invalido' || error.message==='Token Invalido' || error.message === 'Inseriu um formato de Data invalido' || error.message === 'Apenas pode alterar as propriedades {titulo, descricao, limite, precominimo (se nao houverem licitacoes registadas)}' || error.message === 'artigoId Invalido' || error.message === 'Voce ja tem a sessao iniciada!' || error.message === 'Insira uma data posterior a data atual') {
		return res.status(400).json({erro: error.message});
	} 
	
	//	UNAUTHORIZED
	else if (error.message === 'Apenas o Vendedor tem permissao para editar o leilao') {
		return res.status(401).json({erro: error.message});
	}
	
	//	FORBIDDEN
	else if (error.message.includes('Nao pode alterar o preco minimo porque ja existem') || error.message==='Nao pode licitar o seu proprio leilao' || error.message === 'Esse Artigo ja se encontra a ser leiloado' || error.message === 'Utilizador ou palavra-chave invalidos. Por favor, tente novamente.') {
		return res.status(403).json({erro: error.message});
	}
	
	//	NOT ACCEPTABLE
	else if (error.message.includes('O valor proposto tem de ser superior a')) {
		return res.status(406).json({erro: error.message});
	}
	
	//	LOCKED
	else if (error.message === 'O Leilao encontra-se encerrado') {
		return res.status(423).json({erro: error.message});
	} 
	
	else res.status(500).json(error.message);
});

app.listen(process.env.PORT || PORT, () => console.log(`Its alive on http://diogo-rodrigo-bd.herokuapp.com`));

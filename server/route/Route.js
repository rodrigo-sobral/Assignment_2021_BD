const express = require('express');
const router = express.Router();
const server_service= require('../service/Service');

router.get('/dbproj/user', async (req, res) => {
    const posts= await server_service.getUsers();
    res.status(200).json(posts);
});

router.post('/dbproj/user', async function (req, res, next) {
	const new_user= req.body;
    if (!new_user || Object.keys(new_user).length===0) res.status(418).send({erro: 'Deve inserir um Novo Utilizador!'})
    else if (Object.keys(new_user).length!=3 || !new_user['username'] || !new_user['email'] || !new_user['password']) 
        res.status(418).send({erro: 'Deve inserir um Novo Utilizador com o seguinte conteudo: {\'username\', \'emails\', \'password\'}'})
    else {
        try {
            const new_user_id= await server_service.postNewUser(new_user);
            res.status(201).json(new_user_id);
        } catch (e) { next(e); }
	}
});

router.put('/dbproj/user', async function (req, res, next) {
    const login_user= req.body
    if (!login_user) res.status(418).send('Deve inserir um Utilizador Registado!')
    else {
        try {
            const auth_token= await server_service.authenticateUser(login_user);
            res.status(201).json({authToken: auth_token});
        } catch (e) { next(e); }
	}
});

router.post('/dbproj/leilao', async function (req, res, next) {
    const new_auction= req.body;
    if (!new_auction || Object.keys(new_auction).length==0) res.status(418).send({erro: 'Deve inserir um Novo Leilao!'})
    else if (new_auction['artigoId'] && new_auction['titulo'] && new_auction['descricao'] && new_auction['limite'] && new_auction['authToken']) {
        if (Object.keys(new_auction).length==5 || (Object.keys(new_auction).length==6 && new_auction['precoMinimo'])) {
            try {
                const auction_id= await server_service.postNewAuction(new_auction);
                res.status(201).json(auction_id);
            } catch (e) { next(e); }
        } else {
            res.status(418).send({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precoMinimo\' (nao obrigatorio), \'limite\', \'artigoId\', \'authToken\'}'})
        }
    } 
    else
        res.status(418).send({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precoMinimo\' (nao obrigatorio), \'limite\', \'artigoId\', \'authToken\'}'})
});
module.exports= router;
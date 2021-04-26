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

/*
app.post('/login', (req, res, next) => {
    //esse teste abaixo deve ser feito no seu banco de dados
    if(req.body.user === 'luiz' && req.body.password === '123'){
      //auth ok
      const id = 1; //esse id viria do banco de dados
      const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: 300 // expires in 5min
      });
      return res.json({ auth: true, token: token });
    }
    
    res.status(500).json({message: 'Login inválido!'});
})
*/

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

/**
 * TODO
 * ERRO PRA CORRIGIR: null value in column "authtoken" of relation "users" violates not-null constraint
 * AUTHTOKEN DEVE PODER SER NULL, PORQUE, SE O UTILIZADOR NAO INICIAR SESSAO, O AUTH TOKEN ESTÁ A NULL
 */

router.post('/dbproj/user/logout', function(req, res) {
    res.json({ auth: false, token: null });
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

router.get('/dbproj/leiloes', async function (req, res, next) {
    const auctions= await server_service.getAllAuctions();
    if (auctions.length==0) res.status(404).json({erro: 'Nao ha leiloes registados'});
    else res.status(200).json(auctions);
});

router.get('/dbproj/leilao/', async function (req, res, next) {
    if (req.query.keyword) {
        const auctions= await server_service.getSpecificAuctionsBy(req.query.keyword);
        if (auctions.length==0) res.status(404).json({erro: 'Nao ha leiloes registados'});
        else res.status(200).json(auctions);
    } else if (req.query.leilaoId) {
        const auctions= await server_service.searchSpecificAuction(req.query.leilaoId);
        if (auctions.length==0) res.status(404).json({erro: 'Nao ha leiloes registados'});
        else res.status(200).json(auctions);
    } else {
        res.status(418).send({erro: 'A query deve ter o seguinte formato: .../?keyword= ou .../?leilaoId='});
    }
});

module.exports= router;
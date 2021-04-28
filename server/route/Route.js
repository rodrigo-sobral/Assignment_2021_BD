const express = require('express');
const router = express.Router();
const server_service= require('../service/Service');
const jwt = require('jsonwebtoken');
require("dotenv-safe").config();

router.get('/dbproj/user', async (req, res) => {
    const posts= await server_service.getUsers();
    res.status(200).json(posts);
});

router.post('/dbproj/user', async function (req, res, next) {
	const new_user= req.body;
    if (!new_user || Object.keys(new_user).length===0) return res.status(418).send({erro: 'Deve inserir um Novo Utilizador!'})
    else if (Object.keys(new_user).length!=3 || !new_user['username'] || !new_user['email'] || !new_user['password']) 
        return res.status(418).send({erro: 'Deve inserir um Novo Utilizador com o seguinte conteudo: {\'username\', \'emails\', \'password\'}'})
    try {
        const new_user_id= await server_service.postNewUser(new_user);
        return res.status(201).json(new_user_id);
    } catch (e) { next(e); }
});

router.put('/dbproj/user', async function (req, res, next) {
    const logged_user= req.body
    if (!logged_user) return res.status(400).send('Deve inserir um Utilizador Registado!')
    else {
        try {
            const auth_token= await server_service.login(logged_user);
            return res.status(200).json({authToken: auth_token, 'Aviso ⚠': 'Este Token tem duracao duma hora. Deve passa-lo como parametro nos headers de todos os requests que fizer com o seguinte formato: authToken=o_seu_token'});
        } catch (e) { next(e); }
	}
});

router.put('/dbproj/user/logout', async function(req, res, next) {
    if (req.headers.authtoken) {
        const logged_out_user= await server_service.searchUserByAuthToken(req.headers.authtoken);
        if (logged_out_user && logged_out_user.length!=0) {
            await server_service.logout(req.headers.authtoken);
            res.status(200).send({resp: 'Sessao Terminada com Sucesso'})
        } else res.status(418).send({resp: 'Esse Utilizador nao tem sessao iniciada'})
    } else return res.status(409).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

router.post('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const new_auction= req.body;
        if (!new_auction || Object.keys(new_auction).length==0) return res.status(418).send({erro: 'Deve inserir um Novo Leilao!'})
        else if (new_auction['artigoId'] && new_auction['titulo'] && new_auction['descricao'] && new_auction['limite'] && new_auction['authToken']) {
            if (Object.keys(new_auction).length==5 || (Object.keys(new_auction).length==6 && new_auction['precoMinimo'])) {
                try {
                    const auction_id= await server_service.postNewAuction(new_auction);
                    return res.status(201).json(auction_id);
                } catch (e) { next(e); }
            }
            else return res.status(418).send({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precoMinimo\' (nao obrigatorio), \'limite\', \'artigoId\', \'authToken\'}'})
        } else
            return res.status(418).send({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precoMinimo\' (nao obrigatorio), \'limite\', \'artigoId\', \'authToken\'}'})
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

router.get('/dbproj/leiloes', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const auctions= await server_service.getAllAuctions();
        if (auctions.length==0) return res.status(404).json({erro: 'Nao ha leiloes registados'});
        else return res.status(200).json(auctions);
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

router.get('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
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
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  ========================================================================================
const tokenAuthentication= async (req, res) => {
    const referenced_user= await server_service.searchUserByAuthToken(req.headers.authtoken);
    return jwt.verify(req.headers.authtoken, process.env.SECRET, async function(err, decoded) {
        if (err) {
            if (referenced_user && referenced_user.length!=0) {
                await server_service.logout(req.headers.authtoken);
                res.status(408).json({ erro: 'O Token expirou, inicie sessao novamente' });
            }
            else res.status(400).json({ erro: 'Token Invalido' });
            return false;
        }
        if (!referenced_user || referenced_user.length==0) {
            res.status(401).json({ erro: 'Precisa de ter uma sessao iniciada!' });
            return false
        }
        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
        return true;
    })
}

module.exports= router;
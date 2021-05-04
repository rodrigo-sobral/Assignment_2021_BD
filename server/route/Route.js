const express = require('express');
const router = express.Router();
const server_service= require('../service/Service');
const jwt = require('jsonwebtoken');
require("dotenv-safe").config();

//  ========================================================================================
//  USERS
//  ========================================================================================

//  FOR TESTING PURPOSES ONLY
//  ========================================================================================
router.get('/dbproj/user', async (req, res) => { res.status(200).json(await server_service.getUsers()); });

//  CREATE NEW USER
//  ========================================================================================
router.post('/dbproj/user', async function (req, res, next) {
	const new_user= req.body;
    if (!new_user || Object.keys(new_user).length==0) return res.status(400).send({erro: 'Deve inserir um Novo Utilizador!'})
    else if (Object.keys(new_user).length!=3 || !new_user['username'] || !new_user['email'] || !new_user['password']) 
        return res.status(400).send({erro: 'Deve inserir um Novo Utilizador com o seguinte conteudo: {\'username\', \'emails\', \'password\'}'})
    try {
        const new_user_id= await server_service.postNewUser(new_user);
        return res.status(201).json(new_user_id);
    } catch (e) { next(e); }
});


//  LOGIN
//  ========================================================================================
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

//  LOGOUT
//  ========================================================================================
router.put('/dbproj/user/logout', async function(req, res, next) {
    if (req.headers.authtoken) {
        const logged_out_user= await server_service.searchUserByAuthToken(req.headers.authtoken);
        if (logged_out_user && logged_out_user.length!=0) {
            await server_service.logout(req.headers.authtoken);
            return res.status(200).send({resp: 'Sessao Terminada com Sucesso'})
        } else return res.status(400).send({resp: 'Esse Utilizador nao tem sessao iniciada'})
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});


//  ========================================================================================
//  AUCTIONS
//  ========================================================================================

//  GET ALL AUCTIONS
//  ========================================================================================
router.get('/dbproj/leiloes', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        //  CHECK THE AMOUNT OF PARAMETERS
        if (Object.keys(req.query).length==1 && req.query.keyword) {
            const auctions= await server_service.getAuctionByArtigoOrDescricao(req.query.keyword);
            if (auctions.length==0) res.status(404).json({erro: `Nao foram encontrados leiloes com o keyword= ${req.query.keyword}`});
            else res.status(200).json(auctions);
        } else if (Object.keys(req.query).length==0) {
            const auctions= await server_service.getAllAuctions();
            if (auctions.length==0) return res.status(404).json({erro: 'Nao ha leiloes registados'});
            else return res.status(200).json(auctions);
        } else return res.status(400).send({erro: 'A query so pode ter o seguinte formato: .../?keyword='});
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  GET SPECIFIC AUCTION BY DESCRICAO OR ARTIGOID
//  ========================================================================================
router.get('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        //  CHECK THE AMOUNT OF PARAMETERS
        if (Object.keys(req.query).length==1 && req.query.leilaoId) {
            try {
                const auctions= await server_service.getAllInfoAboutSpecificAution(req.query.leilaoId); 
                if (auctions.length==0) return res.status(404).json({erro: `Nao foram encontrados leiloes com a leilaoId= ${req.query.leilaoId}`});
                else return res.status(200).json(auctions);
            } catch (e) { next(e); }

        } else return res.status(400).send({erro: 'A query deve ter o seguinte formato: .../?leilaoId='});
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  CREATE NEW AUCTION
//  ========================================================================================
router.post('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const new_auction= req.body;
        //  IF WE EVEN HAVE A BODY
        if (!new_auction || Object.keys(new_auction).length==0) return res.status(400).send({erro: 'Deve inserir um Novo Leilao'})
        //  IF WE HAVE ALL THE NOT NULL PARAMETERS
        else if (new_auction['artigoId'] && new_auction['titulo'] && new_auction['descricao'] && new_auction['limite']) {
            //  IF WE ONLY HAVE 4 PARAMETERS (OR 5 IN CASE OF precoMinimo IS INCLUDED)
            if (Object.keys(new_auction).length==4 || (Object.keys(new_auction).length==5 && new_auction['precoMinimo'])) {
                if (typeof new_auction['artigoId']!=='number') return res.status(400).send({erro: 'artigoId deve ser um inteiro'})
                else if (new_auction['precoMinimo'] && typeof new_auction['precoMinimo']!=='number') return res.status(400).send({erro: 'precoMinimo deve ser um float'})
                else {
                    try { return res.status(201).json(await server_service.postNewAuction(new_auction, req.headers.authtoken)); } 
                    catch (e) { next(e); }
                }
            } else 
                return res.status(400).send({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precoMinimo\' (nao obrigatorio), \'limite\', \'artigoId\'}'})
        } else
            return res.status(400).send({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precoMinimo\' (nao obrigatorio), \'limite\', \'artigoId\'}'})
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  EDIT AN AUCTION
//  ========================================================================================
router.put('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const edited_auction= req.body;
        const leilaoId= req.query.leilaoId;
        if (!edited_auction || Object.keys(edited_auction).length==0) return res.status(400).send({erro: 'Deve inserir as informacoes que pretende editar'});
        else if (!leilaoId) return res.status(400).send({erro: 'Deve passar o leilaoId por parametro'});
        else if (Object.keys(edited_auction).length>4) return res.status(400).send({erro: 'Apenas pode alterar as propriedades {titulo, descricao, limite, precoMinimo (se nao houverem licitacoes registadas)}'});
        else {
            try {
                const result= await server_service.editAuction(edited_auction, leilaoId, req.headers.authtoken);
                return res.status(200).json(result);
            } catch (e) { next(e); }
        } 
    } else return res.status(401).send({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  AUTHENTICATE A TOKEN CHECKING ITS EXISTENCE IN JWT DATABASE AND IN OUR DATABASE -  RETURNS TRUE IF IT EXISTS, FALSE OTHERWISE
//  ========================================================================================
const tokenAuthentication= async (req, res) => {
    const referenced_user= await server_service.searchUserByAuthToken(req.headers.authtoken);
    return jwt.verify(req.headers.authtoken, process.env.SECRET, async function(err, decoded) {
        if (err) {
            if (referenced_user && Object.keys(referenced_user).length!=0) {
                await server_service.logout(req.headers.authtoken);
                res.status(408).json({ erro: 'O Token expirou, inicie sessao novamente' });
            }
            else res.status(400).json({ erro: 'Token Invalido' });
            return false;
        }
        if (!referenced_user || Object.keys(referenced_user).length==0) {
            res.status(401).json({ erro: 'Precisa de ter uma sessao iniciada!' });
            return false
        }
        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
        return true;
    })
}

module.exports= router;
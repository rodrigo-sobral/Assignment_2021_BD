const express = require('express');
const router = express.Router();
const server_service= require('../service/Service');
const jwt = require('jsonwebtoken');
require('dotenv-safe').config();


//  ========================================================================================
//  USERS
//  ========================================================================================

//  CREATE NEW USER
//  ========================================================================================
router.post('/dbproj/user', async function (req, res, next) {
	const new_user= req.body;
    if (!new_user || Object.keys(new_user).length==0) 
        return res.status(400).json({erro: 'Deve inserir um Novo Utilizador'})
    if (Object.keys(new_user).length!=3 || !new_user['username'] || !new_user['email'] || !new_user['password']) 
        return res.status(400).json({erro: 'Deve inserir um Novo Utilizador com o seguinte conteudo: {\'username\', \'emails\', \'password\'}'})
    try { return res.status(201).json(await server_service.postNewUser(new_user)); } 
    catch (e) { next(e); }
});


//  LOGIN
//  ========================================================================================
router.put('/dbproj/user', async function (req, res, next) {
    const logged_user= req.body
    if (!logged_user) return res.status(400).json('Deve inserir um Utilizador Registado!')
    try {
        const auth_token= await server_service.login(logged_user);
        return res.status(200).json({authToken: auth_token, 'Aviso ⚠': 'Este Token tem duracao duma hora. Deve passa-lo como parametro nos headers de todos os requests que fizer com o seguinte formato: authToken=o_seu_token'});
    } catch (e) { next(e); }
});

//  LOGOUT
//  ========================================================================================
router.put('/dbproj/user/logout', async function(req, res, next) {
    if (req.headers.authtoken) {
        const logged_out_user= await server_service.searchUserByAuthToken(req.headers.authtoken);
        if (logged_out_user && logged_out_user.length!=0) {
            await server_service.logout(req.headers.authtoken);
            return res.status(200).json({resp: 'Sessao Terminada com Sucesso'})
        } return res.status(400).json({erro: 'Esse Utilizador nao tem sessao iniciada'})
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});


//  ========================================================================================
//  AUCTIONS
//  ========================================================================================

//  CREATE NEW AUCTION
//  ========================================================================================
router.post('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const new_auction= req.body;
        //  IF WE EVEN HAVE A BODY
        if (!new_auction || Object.keys(new_auction).length==0) return res.status(400).json({erro: 'Deve inserir um Novo Leilao'})
        //  IF WE HAVE ALL THE NOT NULL PARAMETERS
        if (new_auction['artigoId'] && new_auction['titulo'] && new_auction['descricao'] && new_auction['limite']) {
            //  IF WE ONLY HAVE 4 PARAMETERS (OR 5 IN CASE OF precominimo IS INCLUDED)
            if (Object.keys(new_auction).length==4 || (Object.keys(new_auction).length==5 && new_auction['precominimo'])) {
                if (new Date(new_auction['limite']) < Date.now()) return res.status(400).json({erro: 'Insira uma data posterior a data atual'});
                if (typeof new_auction['artigoId']!=='number') 
                    return res.status(400).json({erro: 'artigoId deve ser um inteiro'})
                if (new_auction['precominimo'] && typeof new_auction['precominimo']!=='number') 
                    return res.status(400).json({erro: 'precominimo deve ser um float'})
                try { 
                    const result = await server_service.postNewAuction(new_auction, req.headers.authtoken);
                    return res.status(201).json({leilaoId: result}); 
                } catch (e) { next(e); }
            }
            else return res.status(400).json({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precominimo\' (nao obrigatorio), \'limite\', \'artigoId\'}'})
        }
        else return res.status(400).json({erro: 'Deve inserir um Novo Leilao com o seguinte conteudo: {\'titulo\', \'descricao\', \'precominimo\' (nao obrigatorio), \'limite\', \'artigoId\'}'})
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  GET ALL AUCTIONS OR SPECIFIC AUCTION BY DESCRICAO
//  ========================================================================================
router.get('/dbproj/leiloes', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        //  CHECK THE AMOUNT OF PARAMETERS
        if (Object.keys(req.query).length==1 && req.query.keyword) {
            const auctions= await server_service.getAuctionByArtigoidOrDescricao(req.query.keyword);
            if (auctions.length==0) return res.status(404).json({erro: `Nao foram encontrados leiloes com o keyword= ${req.query.keyword}`});
            return res.status(200).json(auctions);
        } 
        if (Object.keys(req.query).length==0) {
            const auctions= await server_service.getAllRunningAuctions();
            if (auctions.length==0) return res.status(404).json({erro: 'Nao ha leiloes registados'});
            return res.status(200).json(auctions);
        }
        else return res.status(400).json({erro: 'A query so pode ter o seguinte formato: .../?keyword='});
    }
    else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  GET ALL INFORMATION ABOUT A SPECIFIC AUCTION BY LEILAOID
//  ========================================================================================
router.get('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        //  CHECK THE AMOUNT OF PARAMETERS
        if (Object.keys(req.query).length==1 && req.query.leilaoId) {
            try {
                const auctions= await server_service.getAllInfoAboutSpecificAution(req.query.leilaoId); 
                if (auctions.length==0) return res.status(404).json({erro: `Nao foram encontrados leiloes com a leilaoId= ${req.query.leilaoId}`});
                return res.status(200).json(auctions);
            } catch (e) { next(e); }
        } else return res.status(400).json({erro: 'A query deve ter o seguinte formato: .../?leilaoId='});
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  GET ACTIVITY OF THE USER
//  ========================================================================================
router.get('/dbproj/user/atividade', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        return res.status(200).json(await server_service.getUserActivity(req.headers.authtoken));
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  MAKE A BID
//  ========================================================================================
router.get('/dbproj/licitar', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const leilaoId= req.query.leilaoId;
        const licitacao= req.query.licitacao;
        if (!leilaoId) return res.status(400).json({erro: 'Deve passar o leilaoId por parametro'});
        if (!licitacao) return res.status(400).json({erro: 'Deve passar a licitacao por parametro'});
        try {
            return res.status(200).json({licitacaoId: await server_service.makeBid(leilaoId, licitacao, req.headers.authtoken)});
        } catch (e) { next(e); }
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  EDIT AN AUCTION
//  ========================================================================================
router.put('/dbproj/leilao', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        const edited_auction= req.body;
        if (!edited_auction || Object.keys(edited_auction).length==0) return res.status(400).json({erro: 'Deve inserir as informacoes que pretende editar'});
        if (!req.query.leilaoId) return res.status(400).json({erro: 'Deve passar o leilaoId por parametro'});
        if (Object.keys(edited_auction).length>4) return res.status(400).json({erro: 'Apenas pode alterar as propriedades {titulo, descricao, limite, precominimo (se nao houverem licitacoes registadas)}'});
        
        try { return res.status(200).json(await server_service.editAuction(edited_auction, req.query.leilaoId, req.headers.authtoken)); } 
        catch (e) { next(e); }
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  WRITE IN MURAL
//  ========================================================================================
router.post('/dbproj/leilao/mural', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        if (!req.query.leilaoId) return res.status(400).json({erro: 'Deve passar o leilaoId por parametro'});
        if (!req.body['mensagem']) return res.status(400).json({erro: 'Deve inserir a sua mensagem com o formato { mensagem: ... }'});

        try { return res.status(200).json({resp: await server_service.writeInMural(req.query.leilaoId, req.headers.authtoken, req.body['mensagem'])}); } 
        catch (e) { next(e); }
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  CHECK INBOX
//  ========================================================================================
router.get('/dbproj/user/inbox', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        return res.status(200).json({inbox: await server_service.checkUserInbox(req.headers.authtoken)});
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  CLEAR INBOX
//  ========================================================================================
router.delete('/dbproj/user/inbox', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        return res.status(200).json({inbox: await server_service.clearInbox(req.headers.authtoken)});
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
});

//  GET PRODUCTS
//  ========================================================================================
router.get('/dbproj/artigos', async function (req, res, next) {
    if (req.headers.authtoken) {
        if (!await tokenAuthentication(req, res)) return;
        return res.status(200).json(await server_service.getAllArtigos());
    } else return res.status(401).json({ erro: 'Deve passar o authToken do usuario como parametro dos headers' });
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
        // IF IT'S EVERYTHING OK, STORES IN THE REQUEST TO FUTURE USES
        req.userId = decoded.id;
        return true;
    })
}

module.exports= router;
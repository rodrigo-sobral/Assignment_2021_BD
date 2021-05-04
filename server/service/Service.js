const data_management = require('../data/Data');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
require("dotenv-safe").config();

//	===============================================================================================
//	USERS
//	===============================================================================================

exports.getUsers= () => {
    return data_management.getUsers();
}

exports.postNewUser= async (new_user) => {
    const result= await data_management.searchSpecificUser('userid', 'username', new_user['username']);
    if (result.length!=0) throw new Error('Esse Username ja foi registado');
    else {
        const result= await data_management.searchSpecificUser('userid', 'email', new_user['email']);
        if (result.length!=0) throw new Error('Esse Email ja foi registado');
        else {
            new_user['password']= crypto.createHash('sha512').update(new_user['password']).digest('hex');
            await data_management.postUser(new_user);
            return await data_management.searchSpecificUser('userid', 'username', new_user['username']);
        }
    }
}

exports.login= async (user) => {
    const TIME_TO_EXPIRE= 60 * 60; // 60s * 60 min = 1h
    const encrypted_pass= crypto.createHash('sha512').update(user['password']).digest('hex');
    const result= await data_management.login(user['username'], encrypted_pass);
    if (result && result.length==0) throw new Error('Utilizador ou palavra-chave invalidos. Por favor, tente novamente.');
    else if (result[0]['authtoken']) throw new Error('Voce ja tem a sessao iniciada!');
    else {
        const user_id= result[0]['userid'];
        const authToken = jwt.sign({ user_id }, process.env.SECRET, { expiresIn: TIME_TO_EXPIRE })
        await data_management.updateUserAuthToken(authToken, 'userId', user_id);
        return authToken;
    }
}

exports.logout= async (authToken) => {
    await data_management.updateUserAuthToken(null, 'authtoken', authToken);
}

exports.searchUserByAuthToken= async (authToken) => {
    try { return await data_management.searchSpecificUser('*', 'authtoken', authToken); } 
    catch (e) { return null; }
}

//	===============================================================================================
//	AUCTION
//	===============================================================================================

exports.postNewAuction= async (new_auction, seller_token) => {
    const user_result= await data_management.searchSpecificUser('userid', 'authtoken', seller_token);
    const artigo_result= await data_management.searchSpecificArtigo('artigoId, leiloado', 'artigoId', new_auction['artigoId']);
    if (artigo_result.length!=1) throw new Error('artigoId Invalido');
    else if (artigo_result[0]['leiloado']) throw new Error('Esse Artigo ja se encontra a ser leiloado');
    else {
        try {
            await data_management.postAuction(new_auction, user_result[0]['userid']);   
            await data_management.unAvailableArtigo(new_auction['artigoId'], true);
            const leilaoId= await data_management.getLastAuctionOfUser('leilaoId', user_result[0]['userid'], new_auction['artigoId']);
            delete Object.assign(leilaoId[0], {['leilaoId']: leilaoId[0]['max'] })['max'];
            return leilaoId;
        } catch (e) { 
            if (e.message.includes('date/time field value out of range') || e.message.includes('invalid input syntax for type timestamp:')) 
                throw new Error('Inseriu um formato de Data invalido'); 
            else throw new Error('Erro desconhecido, contacte o Administrador\n'+e); 
        }
    }
}

exports.getAllAuctions= async () => {
    return await data_management.getAllAuctions();
}

exports.getAuctionByArtigoOrDescricao= async (keyword) => {
    try {
        const artigoId= parseInt(keyword);
        return await data_management.getAuctionByArtigoOrDescricao(artigoId);
    } catch (e) {
        return await data_management.getAuctionByArtigoOrDescricao(keyword);
    }
}

exports.getAllInfoAboutSpecificAution= async (leilaoId) => {
    //  TODO: MURAL AND BIDDINGS MUST APPEAR TOO
    try { return await data_management.searchSpecificAuction("*", "leilaoId", leilaoId, false, false, false); } 
    catch (e) { throw new Error('Insira um leilaoId valido'); }
}

exports.editAuction= async (edited_auction, leilaoId, seller_token) => {
    leilaoId= parseInt(leilaoId);
    const referenced_auction= await data_management.searchSpecificAuction('*', 'leilaoId', leilaoId);
    const referenced_seller= await data_management.searchSpecificUser('userid', 'authtoken', seller_token);
    if (referenced_seller[0]['userid']!==parseInt(referenced_auction[0]['users_userid'])) throw new Error('Apenas o Vendedor tem permissao para editar o leilao');
    else if (referenced_auction.length==0) throw new Error('Esse leilao nao existe');
    if (!isNaN(leilaoId)) {
        let changed= false;
        if (typeof edited_auction['titulo'] === 'string') {
            await data_management.updateSpecificAuction(leilaoId, 'titulo', '\''+edited_auction['titulo']+'\'');
            changed=true;
        } 
        if (typeof edited_auction['limite'] === 'string') {
            try {
                await data_management.updateSpecificAuction(leilaoId, 'limite_data_hora', '\''+edited_auction['limite']+'\'');
                changed=true;
            } catch (e) { 
                if (e.message.includes('date/time field value out of range') || e.message.includes('invalid input syntax for type timestamp:'))  
                    throw new Error('Inseriu um formato de Data invalido'); 
                else console.log(e); 
            }
        }
        if (typeof edited_auction['descricao'] === 'string') {
            await data_management.updateSpecificAuction(leilaoId, 'descricao', '\''+edited_auction['descricao']+'\'');
            changed=true;
        }
        //  IF THERE'S ALREADY A REGISTED BID, DOESN'T ALLOW TO EDIT MINIMUM PRICE
        if (typeof edited_auction['precoMinimo'] === 'number') {
            const registed_bids= await data_management.getMaxBidFromAuction('count(*)', 'leilaoId', leilaoId);
            if (registed_bids[0]['count']==0) {
                try {
                    await data_management.updateSpecificAuction(leilaoId, 'preco_minimo', edited_auction['precoMinimo']);
                    changed=true;
                } catch (e) { throw new Error(`Insira um precoMinimo valido`);  }
            } else throw new Error(`Nao pode alterar o preco minimo porque ja existem ${registed_bids} licitacoes registadas`);
        } 

        
        if (!changed) throw new Error('Apenas pode alterar as propriedades {titulo, descricao, limite, precoMinimo (se nao houverem licitacoes registadas)}');
        else {
            const selected_auction= await data_management.searchSpecificAuction('*', 'leilaoId', leilaoId);
            return selected_auction[0];
        } 
    } else throw new Error('Insira um leilaoId valido');
}

//  =================================================================================================================

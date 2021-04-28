const data_management = require('../data/Data');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
require("dotenv-safe").config();

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

exports.searchUserByAuthToken= async (authToken) => {
    try { return await data_management.searchSpecificUser('*', 'authtoken', authToken); } 
    catch (e) { return null; }
}

exports.login= async (user) => {
    const TIME_TO_EXPIRE= 60*60; // 60s * 60 min
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

exports.postNewAuction= async (new_auction) => {
    const user_result= await data_management.searchSpecificUser('userid', 'authtoken', new_auction['authToken']);
    const artigo_result= await data_management.searchSpecificArtigo('artigoId, leiloado', 'artigoId', new_auction['artigoId']);
    if (user_result.length!=1) throw new Error('Esse Username nao esta registado');
    else if (artigo_result.length!=1) throw new Error('Esse Artigo nao esta registado');
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
            else throw new Error('Erro desconhecido, contacte o Administrador!'); 
        }
    }
}

exports.getAllAuctions= async () => {
    return await data_management.getAllAuctions();
}

exports.getSpecificAuctionsBy= async (keyword) => {
    try {
        const artigoId= parseInt(keyword);
        return await data_management.getSpecificAuctionsBy(artigoId);
    } catch (e) {
        return await data_management.getSpecificAuctionsBy(keyword);
    }
}

exports.searchSpecificAuction= async (leilaoId) => {
    try { return await data_management.searchSpecificAuction("*", "leilaoId", leilaoId);
    } catch (e) { throw new Error('Insira um leilaoId valido!'); }
}

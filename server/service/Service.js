const data_management = require('../data/Data');
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');

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
            new_user['authtoken']= uuidv4();
            done= true;
            do {
                try { await data_management.postUser(new_user); done=false; }
                catch(e) { new_user['authtoken']= uuidv4(); await data_management.postUser(new_user); }
            } while (done);
            return await data_management.searchSpecificUser('userid', 'username', new_user['username']);
        }
    }
}

exports.authenticateUser= async (user) => {
    const result= await data_management.searchSpecificUser('*', 'username', user['username']);
    if (result && result.length==0) throw new Error('Utilizador ou palavra-chave invalidos. Por favor, tente novamente.');
    else {
        if (crypto.createHash('sha512').update(user['password']).digest('hex')===result[0]['password']) return result[0]['authtoken'];
        else throw new Error('Utilizador ou palavra-chave invalidos. Por favor, tente novamente.');
    }
}

exports.postNewAuction= async (new_auction) => {
    const user_result= await data_management.searchSpecificUser('userid', 'authtoken', new_auction['authToken']);
    const artigo_result= await data_management.searchSpecificArtigo('artigoId, leiloado', 'artigoId', new_auction['artigoId']);
    if (user_result.length!=1) throw new Error('Esse Username nao esta registado');
    else if (artigo_result.length!=1) throw new Error('Esse Artigo nao esta registado');
    else if (artigo_result[0]['leiloado']==true) throw new Error('Esse Artigo ja se encontra a ser leiloado');
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
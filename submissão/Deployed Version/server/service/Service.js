const data_management = require('../data/Data');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
require('dotenv-safe').config();

//	===============================================================================================
//	USERS
//	===============================================================================================

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
    const seller_id= (await data_management.searchSpecificUser('userid', 'authtoken', seller_token))[0]['userid'];
    const artigo_result= await data_management.searchSpecificArtigo('artigoId, leiloado', 'artigoId', new_auction['artigoId']);
    if (artigo_result.length!=1) throw new Error('artigoId Invalido');
    else if (artigo_result[0]['leiloado']) throw new Error('Esse Artigo ja se encontra a ser leiloado');
    else {
        try {
            await data_management.postAuction(new_auction, seller_id);   
            await data_management.unAvailableArtigo(new_auction['artigoId'], true);
            const new_leilaoId= (await data_management.customRequest(`select max(leilaoId) from leilao where users_userid= \'${seller_id}\' and artigo_artigoId= \'${new_auction['artigoId']}\'`))[0]['max'];
            new_auction['leilaoid']= new_leilaoId
            await data_management.postNewAuctionVersion(new_auction);
            return new_leilaoId;
        } catch (e) { 
            if (e.message.includes('date/time field value out of range') || e.message.includes('invalid input syntax for type timestamp:')) 
                throw new Error('Inseriu um formato de Data invalido'); 
            else throw new Error('Erro desconhecido, contacte o Administrador\n'+e); 
        }
    }
}

exports.getAllRunningAuctions= async () => { 
    const all_elections= await data_management.searchSpecificAuction('leilaoId, descricao, limite', 'fechado', false, false); 
    for (const i in all_elections) {
        if (!await this.checkAuctionLimit(all_elections[i])) delete all_elections[i];
        else delete all_elections[i]['limite'];
    }
    return all_elections;
}

exports.getAuctionByArtigoidOrDescricao= async (keyword) => {
    try {
        const artigoId= parseInt(keyword);
        return await data_management.getAuctionByArtigoidOrDescricao(artigoId);
    } catch (e) { return await data_management.getAuctionByArtigoidOrDescricao(keyword); }
}

exports.getAllInfoAboutSpecificAution= async (leilaoId) => {
    const selected_auction= (await data_management.searchSpecificAuction('*', 'leilao.leilaoId', leilaoId, false))[0];
    if (!selected_auction) throw new Error('leilaoId Invalido');
    this.checkAuctionLimit(selected_auction);
    selected_auction['mural']= await data_management.getAllPostsOfAuction(leilaoId);
    selected_auction['licitacoes']= await data_management.getAllBidsOf('licitacaoId, users_userId, valor_licitado', 'leilao_leilaoid',leilaoId);
    selected_auction['versoes_anteriores']= await data_management.getLastVersions(leilaoId);
    return selected_auction; 
}

exports.getUserActivity= async (auth_token) => {
    const user_id= (await data_management.searchSpecificUser('userid', 'authtoken', auth_token))[0]['userid'];
    return {
        leiloes: await data_management.searchSpecificAuction('*', 'users_userid', user_id, false),
        licitacoes: await data_management.getAllBidsOf('leilao_leilaoid, users_userId, valor_licitado', 'users_userid', user_id)
    };
}

exports.makeBid= async (leilaoId, licitacao, buyer_token) => {
    const selected_auction= (await data_management.searchSpecificAuction('*', 'leilaoId', leilaoId))[0]; 
    if (!selected_auction) throw new Error('leilaoId Invalido');
    if (!await this.checkAuctionLimit(selected_auction)) throw new Error('O Leilao encontra-se encerrado');

    const buyer_id= (await data_management.searchSpecificUser('userId', 'authtoken', buyer_token))[0]['userid'];
    if (buyer_id===parseInt(selected_auction['users_userid'])) throw new Error('Nao pode licitar o seu proprio leilao');
    
    if (licitacao>selected_auction['precominimo']) {
        const max_bid= (await data_management.getMaxBidFromAuction('max(valor_licitado)', 'leilaoId', leilaoId))[0]['max'];
        if (max_bid && licitacao<=max_bid) throw new Error(`O valor proposto tem de ser superior a ${max_bid}`);
        
        //  ADD BID
        await data_management.makeBid(licitacao, selected_auction['leilaoid'], buyer_id);
        return (await data_management.customRequest(`select max(licitacaoid) from licitacao where leilao_leilaoid=${leilaoId} and users_userid=${buyer_id}`))[0]['max'];
    } throw new Error(`O valor proposto tem de ser superior a ${selected_auction['precominimo']}`);
}

exports.editAuction= async (edited_auction, leilaoId, seller_token) => {
    const referenced_auction= (await data_management.searchSpecificAuction('*', 'leilaoId', leilaoId))[0]; 
    if (!referenced_auction) throw new Error('leilaoId Invalido');
    if (!await this.checkAuctionLimit(referenced_auction)) throw new Error('O Leilao encontra-se encerrado');

    const seller_id= (await data_management.searchSpecificUser('userId', 'authtoken', seller_token))[0]['userid'];
    if (seller_id!==parseInt(referenced_auction['users_userid'])) throw new Error('Apenas o Vendedor tem permissao para editar o leilao');

    let changed= false;
    //  CHANGE THE TITLE
    if (edited_auction['titulo'] && typeof edited_auction['titulo'] === 'string') {
        await data_management.updateSpecificAuction(leilaoId, 'titulo', '\''+edited_auction['titulo']+'\''); changed=true;
    } 
    //  CHANGE THE DESCRIPTION
    if (edited_auction['descricao'] && typeof edited_auction['descricao'] === 'string') {
        await data_management.updateSpecificAuction(leilaoId, 'descricao', '\''+edited_auction['descricao']+'\''); changed=true;
    }
    //  CHANGE THE AUCTION LIMIT DATE (WITH DATE VERIFICATION)
    if (edited_auction['limite'] && typeof edited_auction['limite'] === 'string') {
        if (new Date(edited_auction['limite']) < Date.now()) throw new Error('Insira uma data posterior a data atual')
        try { await data_management.updateSpecificAuction(leilaoId, 'limite', '\''+edited_auction['limite']+'\''); changed=true; } 
        catch (e) { 
            if (e.message.includes('date/time field value out of range') || e.message.includes('invalid input syntax for type timestamp:'))  
            throw new Error('Inseriu um formato de Data invalido'); 
            else console.log(e); 
        }
    }
    //  IF THERE'S ALREADY A REGISTED BID, DOESN'T ALLOW TO EDIT MINIMUM PRICE
    if (edited_auction['precominimo'] && typeof edited_auction['precominimo'] === 'number') {
        const registed_bids= (await data_management.getMaxBidFromAuction('count(*)', 'leilaoId', leilaoId))[0]['count'];
        if (registed_bids==0) {
            try { await data_management.updateSpecificAuction(leilaoId, 'precominimo', edited_auction['precominimo']); changed=true; } 
            catch (e) { throw new Error(`Insira um precominimo valido`);  }
        } else throw new Error(`Nao pode alterar o preco minimo porque ja existem ${registed_bids} licitacoes registadas`);
    }

    //  IF NOTHING WAS CHANGED, THEN THE ARGUMENTS WERE WRONG
    if (!changed) throw new Error('Apenas pode alterar as propriedades {titulo, descricao, limite, precominimo (se nao houverem licitacoes registadas)}');
    const updated_election= (await data_management.searchSpecificAuction('*', 'leilaoId', leilaoId))[0];
    await data_management.postNewAuctionVersion(updated_election);
    return updated_election;
}

//	===============================================================================================

exports.writeInMural= async (leilaoId, user_token, message) => {
    const referenced_auction= (await data_management.searchSpecificAuction('*', 'leilaoId', leilaoId))[0]; 
    if (!referenced_auction) throw new Error('leilaoId Invalido');
    if (!await this.checkAuctionLimit(referenced_auction)) throw new Error('O Leilao encontra-se encerrado');
    const user_id= (await data_management.searchSpecificUser('userId', 'authtoken', user_token))[0]['userid'];

    await data_management.postMessageOnMural(leilaoId, user_id, message);
    return 'Mensagem Submetida com Sucesso';
}

exports.checkUserInbox= async (auth_token) => {
    return await data_management.getInboxMessages((await data_management.searchSpecificUser('userid', 'authtoken', auth_token))[0]['userid']);
}
exports.clearInbox= async (auth_token) => {
    await data_management.clearUserInbox((await data_management.searchSpecificUser('userid', 'authtoken', auth_token))[0]['userid']);
    return 'Mensagens eliminadas com Sucesso';
}

exports.getAllArtigos= async () => { return await data_management.customRequest('select * from artigo'); }

//  =================================================================================================================
//  RETURN TRUE IF THE LIMIT WASN'T REACHED, OTHERWISE CLOSES THE AUCTION AND RETURN FALSE
exports.checkAuctionLimit= async (auction) => {
    if (new Date(auction['limite']) > Date.now()) return true;
    //  CLOSE AUCTION
    await data_management.updateSpecificAuction(auction['leilaoid'], 'fechado', true);
    const winner= (await data_management.getMaxBidFromAuction('leilao.users_userid', 'leilao.leilaoid', auction['leilaoid']))[0];
    if (winner && winner['users_userid']) await data_management.updateSpecificAuction(auction['leilaoid'], 'vencedorid', winner['users_userid']);
    else await data_management.unAvailableArtigo(auction['artigo_artigoid'], false);
    return false;
}


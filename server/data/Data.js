const database = require('../infra/Database');


//	===============================================================================================
//	USERS
//	===============================================================================================

exports.getUsers = async() => {
	return await database.query('select * from users');
}

exports.postUser = async (new_user) => {
	await database.query('begin transaction');
	await database.query('insert into users (username, email, password) values ($1, $2, $3)', [new_user.username, new_user.email, new_user.password])
	await database.query('commit');
}

exports.login= async (username, password) => {
	return await database.query(`select * from users where username= \'${username}\' and password=\'${password}\'`);
}

exports.searchSpecificUser= async (what_to_get, parameter, parameter_value) => {
	return await database.query(`select ${what_to_get} from users where ${parameter}= \'${parameter_value}\'`);
}

exports.updateUserAuthToken= async (authToken, parameter, parameter_value) => {
	if (authToken!=null) return await database.query(`update users set authtoken= \'${authToken}\' where ${parameter}= \'${parameter_value}\'`);
	else return await database.query(`update users set authtoken=null where ${parameter}= \'${parameter_value}\'`);
}


//	===============================================================================================
//	AUCTION
//	===============================================================================================

exports.postAuction = async (new_auction, seller_id) => {
	if (new_auction['precoMinimo']) {
		await database.query('begin transaction');
		await database.query('insert into leilao (titulo, descricao, precominimo, limite, users_userid, artigo_artigoid) values ($1, $2, $3, $4, $5, $6)', [new_auction.titulo, new_auction.descricao, new_auction.precoMinimo, new_auction.limite, seller_id, new_auction.artigoId])
		await database.query('commit');
	} else {
		await database.query('begin transaction');
		await database.query('insert into leilao (titulo, descricao, limite, users_userid, artigo_artigoid) values ($1, $2, $3, $4, $5)', [new_auction.titulo, new_auction.descricao, new_auction.limite, seller_id, new_auction.artigoid])
		await database.query('commit');
	}
}

exports.searchSpecificAuction= async (parameter, parameter_value, only_running=true) => {
	if (only_running) return (await database.query(`select * from leilao where ${parameter}= \'${parameter_value}\' and fechado=false`))[0];
	return (await database.query(`select * from leilao where ${parameter}= \'${parameter_value}\'`))[0];
}

exports.getAuctionByArtigoOrDescricao= async (parameter_value) => {
	if (typeof parameter_value!=='string') return await database.query(`select leilaoId, descricao from leilao where artigoId= ${parameter_value} and fechado=false`);
	else return await database.query(`select leilaoId, descricao from leilao where descricao like \'%${parameter_value}%\' and fechado=false`);
}

exports.updateSpecificAuction= async (leilaoId, updated_parameter, updated_value) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE leilao IN EXCLUSIVE MODE');
	await database.query(`update leilao set ${updated_parameter}= ${updated_value} where leilaoId= ${leilaoId}`);
	await database.query('commit');
}

//	===============================================================================================
//	BIDS
//	===============================================================================================

exports.getMaxBidFromAuction= async (what_to_get, parameter, parameter_value) => {
	return await database.query(`select ${what_to_get} from leilao, licitacao where leilao.leilaoId=licitacao.leilao_leilaoId and ${parameter}= \'${parameter_value}\'`);
}

exports.makeBid= async (valor_licitado, leilaoid, buyerId) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE licitacao IN EXCLUSIVE MODE');
	await database.query('insert into licitacao (valor_licitado, users_userid, leilao_leilaoid) values ($1, $2, $3)', [valor_licitado, buyerId, leilaoid]);
	await database.query('commit');
}

exports.getAllBidsOfAuction= async (leilaoId) => {
	if (parseInt((await this.customRequest(`select count(*) from licitacao where leilao_leilaoid=${leilaoId}`))[0]['count'])==0) return null
	return await database.query(`select licitacaoId, users_userId, valor_licitado from licitacao where leilao_leilaoid= ${leilaoId}`);
}

exports.getAllBidsOfUser= async (userId) => {
	if (parseInt((await this.customRequest(`select count(*) from licitacao where users_userid=${userId}`))[0]['count'])==0) return null
	return await database.query(`select leilao_leilaoid, users_userId, valor_licitado from licitacao where users_userid= ${userId}`);
}

//	===============================================================================================
//	MESSAGES
//	===============================================================================================

exports.postMessageOnMural= async (leilaoId, userId, message) => {
	await database.query('begin transaction');
	await database.query('insert into mural (leilao_leilaoid, users_userid, mensagem) values ($1, $2, $3)', [leilaoId, userId, message])
	await database.query('commit');
}

exports.getAllPostsOfAuction= async (leilaoId) => {
	if (parseInt((await this.customRequest(`select count(*) from mural where leilao_leilaoid=${leilaoId}`))[0]['count'])==0) return null
	return await database.query(`select mensagemId, users_userid, mensagem from mural where leilao_leilaoid= ${leilaoId}`);
}

//	===============================================================================================
//	ARTIGO
//	===============================================================================================

exports.searchSpecificArtigo= async (what_to_get, parameter1, parameter_value1) => {
	return await database.query(`select ${what_to_get} from artigo where ${parameter1}= \'${parameter_value1}\'`);
}

exports.unAvailableArtigo= async (artigoId, leiloado_flag) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE artigo IN EXCLUSIVE MODE');
	await database.query(`update artigo set leiloado= $1 where artigoid= $2`, [leiloado_flag, artigoId]);
	await database.query('commit');
}

//	===============================================================================================

exports.customRequest= async (query) => { return await database.query(query); }
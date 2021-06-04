const database = require('../infra/Database');


//	===============================================================================================
//	USERS
//	===============================================================================================

exports.postUser = async (new_user) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE leilao IN EXCLUSIVE MODE');
	await database.query('insert into users (username, email, password) values ($1, $2, $3)', [new_user.username, new_user.email, new_user.password]);
	await database.query('commit');
}

exports.login= async (username, password) => {
	return await database.query(`select * from users where username= \'${username}\' and password=\'${password}\'`);
}

exports.searchSpecificUser= async (what_to_get, parameter, parameter_value) => {
	return await database.query(`select ${what_to_get} from users where ${parameter}= \'${parameter_value}\'`);
}

exports.updateUserAuthToken= async (authToken, parameter, parameter_value) => {
	let user;
	await database.query('begin transaction');
	await database.query('lock table leilao in share mode');
	if (authToken!=null) user= await database.query(`update users set authtoken= \'${authToken}\' where ${parameter}= \'${parameter_value}\'`);
	else user= await database.query(`update users set authtoken=null where ${parameter}= \'${parameter_value}\'`);
	await database.query(`commit`);
	return user;
}


//	===============================================================================================
//	AUCTION
//	===============================================================================================

exports.postAuction = async (new_auction, seller_id) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE leilao IN EXCLUSIVE MODE');
	if (new_auction['precominimo'])
		await database.query('insert into leilao (titulo, descricao, precominimo, limite, users_userid, artigo_artigoid) values ($1, $2, $3, $4, $5, $6)', [new_auction.titulo, new_auction.descricao, new_auction.precominimo, new_auction.limite, seller_id, new_auction.artigoId])
	else
		await database.query('insert into leilao (titulo, descricao, limite, users_userid, artigo_artigoid) values ($1, $2, $3, $4, $5)', [new_auction.titulo, new_auction.descricao, new_auction.limite, seller_id, new_auction.artigoid])
	await database.query('commit');
}

exports.searchSpecificAuction= async (what_to_get, parameter, parameter_value, only_running=true) => {
	let auctions;
	await database.query('begin transaction isolation level read committed');
	if (only_running) auctions= (await database.query(`select ${what_to_get} from leilao where ${parameter}= \'${parameter_value}\' and fechado=false`));
	else auctions= (await database.query(`select ${what_to_get} from leilao where ${parameter}= \'${parameter_value}\'`));

	await database.query('commit');
	return auctions;
}

exports.getAuctionByArtigoidOrDescricao= async (parameter_value) => {
	let auctions;
	await database.query('begin transaction isolation level read committed');
	if (typeof parameter_value!=='string') auctions= await database.query(`select leilaoId, descricao from leilao where artigo_artigoid= ${parameter_value} and fechado=false`);
	else auctions= await database.query(`select leilaoId, leilao.descricao from leilao, artigo where artigo_artigoid=artigoid and artigo.descricao like \'%${parameter_value}%\' and fechado=false`);

	await database.query('commit');
	return auctions;
}

exports.updateSpecificAuction= async (leilaoId, updated_parameter, updated_value) => {
	await database.query('begin transaction');
	await database.query('lock table leilao in share mode');
	await database.query(`update leilao set ${updated_parameter}= ${updated_value} where leilaoId= ${leilaoId}`);
	await database.query('commit');
}

//	===============================================================================================
//	VERSION HISTORY
//	===============================================================================================

exports.postNewAuctionVersion = async (new_auction) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE leilao IN EXCLUSIVE MODE');
	if (new_auction['precominimo'])
		await database.query('insert into historico_versoes (titulo, descricao, precominimo, limite, leilao_leilaoid) values ($1, $2, $3, $4, $5)', [new_auction.titulo, new_auction.descricao, new_auction.precominimo, new_auction.limite, new_auction.leilaoid])
	else
		await database.query('insert into historico_versoes (titulo, descricao, limite, leilao_leilaoid) values ($1, $2, $3, $4)', [new_auction.titulo, new_auction.descricao, new_auction.limite, new_auction.leilaoid])
	await database.query('commit');
}
exports.getLastVersions= async (leilaoId) => { return await database.query(`select * from historico_versoes where leilao_leilaoid=${leilaoId}`); }

//	===============================================================================================
//	BIDS
//	===============================================================================================

exports.getMaxBidFromAuction= async (what_to_get, parameter, parameter_value) => {
	await database.query('begin transaction isolation level read committed');
	const bid= await database.query(`select ${what_to_get} from leilao, licitacao where leilao.leilaoId=licitacao.leilao_leilaoId and ${parameter}= \'${parameter_value}\'`);
	await database.query('commit');
	return bid;
}

exports.makeBid= async (valor_licitado, leilaoId, buyerId) => {
	const previous_winnerid= (await this.getMaxBidFromAuction('leilao.users_userid', 'leilao.leilaoid', leilaoId))[0];
	await database.query('begin transaction');
	await database.query('LOCK TABLE licitacao IN ACCESS EXCLUSIVE MODE');
	await database.query('insert into licitacao (valor_licitado, users_userid, leilao_leilaoid) values ($1, $2, $3)', [valor_licitado, buyerId, leilaoId]);
	await database.query('commit');
	if (previous_winnerid && previous_winnerid['users_userid']!==buyerId) await this.postNotificationInInbox(leilaoId, previous_winnerid['users_userid'], `A sua licitacao no leilao ${leilaoId} foi superada pelo utilizador ${buyerId} no valor de ${valor_licitado}`);
}

exports.getAllBidsOf= async (what_to_get, parameter, parameter_value) => {
	await database.query('begin transaction isolation level read committed');
	const bid= await database.query(`select ${what_to_get} valor_licitado from licitacao where ${parameter}= ${parameter_value}`);
	await database.query('commit');
	return bid;
}

//	===============================================================================================
//	MESSAGES
//	===============================================================================================

exports.postMessageOnMural= async (leilaoId, userId, message) => {
	await database.query('begin transaction');
	await database.query('LOCK TABLE licitacao IN ACCESS EXCLUSIVE MODE');
	await database.query('insert into mural (leilao_leilaoid, users_userid, mensagem) values ($1, $2, $3)', [leilaoId, userId, message])
	await database.query('commit');
	const mural_users= (await this.getAllMuralUsers(leilaoId, userId));
	const sellerid = (await this.searchSpecificAuction('users_userid', 'leilaoid', leilaoId))[0]['users_userid'];
	await this.postNotificationInInbox(leilaoId, sellerid, `O Utilizador ${userId} disse no seu leilao ${leilaoId}: ${message}`);
	if (mural_users) {
		mural_users.forEach(async mural_userid => {
			if (mural_userid['users_userid']!==sellerid)
				await this.postNotificationInInbox(leilaoId, mural_userid['users_userid'], `O Utilizador ${userId} disse no leilao ${leilaoId}: ${message}`);
			});
	}
}

exports.getAllMuralUsers= async (leilaoId, userId) => { 
	await database.query('begin transaction isolation level read committed');
	const messages= await database.query(`select users_userid from mural where leilao_leilaoid= ${leilaoId} and users_userid!=${userId}`); 
	await database.query('commit');
	return messages;
}

exports.getAllPostsOfAuction= async (leilaoId) => { 
	await database.query('begin transaction isolation level read committed');
	const messages= await database.query(`select users_userid, mensagem from mural where leilao_leilaoid= ${leilaoId}`); 
	await database.query('commit');
	return messages;
}

exports.postNotificationInInbox= async (leilaoId, userId, message) => { 
	await database.query('begin transaction');
	await database.query('LOCK TABLE inbox IN ACCESS EXCLUSIVE MODE');
	await database.query('insert into inbox (leilao_leilaoid, users_userid, mensagem) values ($1, $2, $3)', [leilaoId, userId, message])
	await database.query('commit');
}
exports.getInboxMessages= async (userId) => { 
	await database.query('begin transaction isolation level read committed');
	const messages= await database.query(`select leilao_leilaoid, mensagem from inbox where users_userid= ${userId}`);
	await database.query('commit');
	return messages;
}
exports.clearUserInbox= async (userId) => { 
	await database.query('begin transaction');
	await database.query(`delete from inbox * where users_userid= ${userId}`); 
	await database.query('commit');
}


//	===============================================================================================
//	ARTIGO
//	===============================================================================================

exports.searchSpecificArtigo= async (what_to_get, parameter1, parameter_value1) => {
	await database.query('begin transaction isolation level read committed');
	const artigo= await database.query(`select ${what_to_get} from artigo where ${parameter1}= \'${parameter_value1}\'`);
	await database.query('commit');
	return artigo;
}

exports.unAvailableArtigo= async (artigoId, leiloado_flag) => {
	await database.query('begin transaction');
	await database.query('lock table leilao in share mode');
	await database.query(`update artigo set leiloado= $1 where artigoid= $2`, [leiloado_flag, artigoId]);
	await database.query('commit');
}

//	===============================================================================================

exports.customRequest= async (query) => { return await database.query(query); }
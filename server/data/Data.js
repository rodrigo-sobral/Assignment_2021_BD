const database = require('../infra/Database');


//	===============================================================================================
//	USERS
//	===============================================================================================

exports.getUsers = async() => {
	return database.query('select * from users');
}

exports.postUser = async (new_user) => {
	return database.query('insert into users (username, email, password, authtoken) values ($1, $2, $3, $4)', [new_user.username, new_user.email, new_user.password, new_user.authtoken])
}

exports.authenticateUser= async (parameter_value1, parameter_value2) => {
	return database.query(`select * from users where username= \'${parameter_value1}\' and password=\'${parameter_value2}\'`);
}

exports.searchSpecificUser= async (what_to_get, parameter, parameter_value) => {
	return database.query(`select ${what_to_get} from users where ${parameter}= \'${parameter_value}\'`);
}

exports.updateUserAuthToken= async (userId, authToken) => {
	return database.query(`update users set authToken= $1 where userId= $2`, [authToken, userId]);
}


//	===============================================================================================
//	AUCTION
//	===============================================================================================

exports.postAuction = async (new_auction, seller_id) => {
	if (new_auction['precoMinimo'])
	return database.query('insert into leilao (titulo, descricao, preco_minimo, limite_data_hora, users_userid, artigo_artigoid) values ($1, $2, $3, $4, $5, $6)', [new_auction.titulo, new_auction.descricao, new_auction.precoMinimo, new_auction.limite, seller_id, new_auction.artigoId])
	else
	return database.query('insert into leilao (titulo, descricao, limite_data_hora, users_userid, artigo_artigoid) values ($1, $2, $3, $4, $5)', [new_auction.titulo, new_auction.descricao, new_auction.limite, seller_id, new_auction.artigoid])
}

exports.searchSpecificAuction= async (what_to_get, parameter, parameter_value, with_mural, with_bids) => {
	if (with_mural) {
		return database.query(`select ${what_to_get} from leilao, mural where leilao.leilaoId=mural.leilao_leilaoId and ${parameter}= \'${parameter_value}\'`);
	} else if (with_bids) {
		return database.query(`select ${what_to_get} from leilao, licitacao where leilao.leilaoId=mural.leilao_leilaoId and ${parameter}= \'${parameter_value}\'`);
	}
	else return database.query(`select ${what_to_get} from leilao where ${parameter}= \'${parameter_value}\'`);
}

exports.getLastAuctionOfUser= async (what_to_get, parameter_value1, parameter_value2) => {
	return database.query(`select max(${what_to_get}) from leilao where users_userid= \'${parameter_value1}\' and artigo_artigoId= \'${parameter_value2}\'`);
}

exports.getAllAuctions = async() => {
	return database.query('select leilaoId, descricao from leilao');
}

exports.getSpecificAuctionsBy= async (parameter_value) => {
	if (typeof parameter_value!="string") return database.query(`select leilaoId, descricao from leilao where artigoId= ${parameter_value} and fechado=false`);
	else return database.query(`select leilaoId, descricao from leilao where descricao like \'%${parameter_value}%\' and fechado=false`);
}

//	===============================================================================================
//	ARTIGO
//	===============================================================================================

exports.searchSpecificArtigo= async (what_to_get, parameter1, parameter_value1) => {
	return database.query(`select ${what_to_get} from artigo where ${parameter1}= \'${parameter_value1}\'`);
}

exports.unAvailableArtigo= async (artigoId, leiloado_flag) => {
	return database.query(`update artigo set leiloado= $1 where artigoid= $2`, [leiloado_flag, artigoId]);
}

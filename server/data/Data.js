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

exports.searchSpecificUser= async (what_to_get, parameter, parameter_value) => {
	return database.query(`select ${what_to_get} from users where ${parameter}= \'${parameter_value}\'`);
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

exports.searchSpecificAuction= async (what_to_get, parameter, parameter_value) => {
	return database.query(`select ${what_to_get} from leilao where ${parameter}= \'${parameter_value}\'`);
}

exports.getLastAuctionOfUser= async (what_to_get, parameter_value1, parameter_value2) => {
	return database.query(`select max(${what_to_get}) from leilao where users_userid= \'${parameter_value1}\' and artigo_artigoId= \'${parameter_value2}\'`);
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

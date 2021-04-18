const database = require('../infra/Database');

exports.getUsers = async() => {
	return database.query('select * from users');
}

exports.postUser = async (new_user) => {
	return database.query('insert into users (username, email, password, authtoken) values ($1, $2, $3, $4)', [new_user.username, new_user.email, new_user.password,new_user.authtoken])
}


//	===================
exports.searchSpecificUser= async (what_to_get, parameter, parameter_value) => {
	return database.query(`select ${what_to_get} from users where ${parameter}= \'${parameter_value}\'`);
}
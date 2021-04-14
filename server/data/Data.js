const database = require('../infra/Database');

exports.getUsers = () => {
	return database.query('select * from users');
}

exports.postUser = (new_user) => {
	return database.query('insert into users (username, email, password) values ($1, $2, $3)', [new_user.username, new_user.email, new_user.password]);
}
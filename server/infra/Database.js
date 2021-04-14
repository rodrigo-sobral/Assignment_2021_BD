const pgp = require('pg-promise')();
const db = pgp({
    user: 'dbproj',
    password: 'dbproj',
    host: 'localhost',
    port: 5432,
    database: 'dbproj'
});
module.exports= db;
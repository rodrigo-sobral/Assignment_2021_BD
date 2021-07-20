const pgp = require('pg-promise')();
const db = pgp({
    user: 'yrfadwcfqwojyt',
    password: '684d7cab354b0862206612598a15c026c37e8323b42cf340354fcf8e45ac3b40',
    host: 'ec2-54-155-208-5.eu-west-1.compute.amazonaws.com',
    port: 5432,
    database: 'dfa6gl25mfaodp',
    ssl: { rejectUnauthorized: false }
});
module.exports= db;
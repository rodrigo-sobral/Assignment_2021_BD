const data_management = require('../data/Data');
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');

exports.getUsers= () => {
    return data_management.getUsers();
}

exports.postNewUser= async (new_user) => {
    const result= await data_management.searchSpecificUser('userid', 'username', new_user['username']);
    if (result && result.length!=0) throw new Error('Esse Username ja foi registado');
    else {
        const result= await data_management.searchSpecificUser('userid', 'email', new_user['email']);
        if (result && result.length!=0) throw new Error('Esse Email ja foi registado');
        else {
            new_user['password']= crypto.createHash('sha512').update(new_user['password']).digest('hex');
            new_user['authtoken']= uuidv4();
            data_management.postUser(new_user);
            return data_management.searchSpecificUser('userid', 'username', new_user['username']);
        }
    }
}

const data_management = require('../data/Data');
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');

exports.getUsers= () => {
    return data_management.getUsers();
}

exports.postNewUser= async (new_user) => {
    const result= await data_management.searchSpecificUser('userid', 'username', new_user['username']);
    if (result.length!=0) throw new Error('Esse Username ja foi registado');
    else {
        const result= await data_management.searchSpecificUser('userid', 'email', new_user['email']);
        if (result.length!=0) throw new Error('Esse Email ja foi registado');
        else {
            new_user['password']= crypto.createHash('sha512').update(new_user['password']).digest('hex');
            new_user['authtoken']= uuidv4();
            done= true;
            do {
                try { await data_management.postUser(new_user); done=false; }
                catch(e) { new_user['authtoken']= uuidv4(); await data_management.postUser(new_user); }
            } while (done);
            return await data_management.searchSpecificUser('userid', 'username', new_user['username']);
        }
    }
}

exports.authenticateUser= async (user) => {
    const result= await data_management.searchSpecificUser('*', 'username', user['username']);
    if (result && result.length==0) throw new Error('Utilizador ou palavra-chave invalidos. Por favor, tente novamente.');
    else {
        if (crypto.createHash('sha512').update(user['password']).digest('hex')===result[0]['password']) return result[0]['authtoken'];
        else throw new Error('Utilizador ou palavra-chave invalidos. Por favor, tente novamente.');
    }
}


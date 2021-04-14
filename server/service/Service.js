const data_management = require('../data/Data');

exports.getUsers= () => {
    return data_management.getUsers();
}

exports.postNewUser= (new_user) => {
    return data_management.postUser(new_user);
}



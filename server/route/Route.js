const express = require('express');
const router = express.Router();
const server_service= require('../service/Service');

router.get('/dbproj/user', async (req, res) => {
    const posts= await server_service.getUsers();
    res.json(posts);
});

router.post('/dbproj/user', async (req, res) => {
    const new_user= req.body
    if (new_user) res.status(418).send('You must input a New User!')
    else {
        const posts= await server_service.postNewUser(new_user);
        res.json(posts);
    }
});

module.exports= router;
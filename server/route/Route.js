const express = require('express');
const router = express.Router();
const server_service= require('../service/Service');

router.get('/dbproj/user', async (req, res) => {
    const posts= await server_service.getUsers();
    res.status(200).json(posts);
});

router.post('/dbproj/user', async function (req, res, next) {
	const new_user= req.body
    if (!new_user) res.status(418).send('You must input a New User!')
    else {
        try {
            const new_post= await server_service.postNewUser(new_user);
            res.status(201).json(new_post);
        } catch (e) {
		    next(e);
        }
	}
});

module.exports= router;
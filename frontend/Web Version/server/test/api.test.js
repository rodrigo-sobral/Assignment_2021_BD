const crypto = require('crypto');
const axios = require('axios');
const server_service = require('../service/Service');

const generate = function () {
	return crypto.randomBytes(20).toString('hex');
};

const request = function (url, method, data) {
	return axios({ url, method, data, validateStatus: false });
};

test('Should Get Users', async function () {
	//const post1 = await server_service.savePost({ username: generate(), email: generate(), password: generate() });
	const response = await request('http://localhost:8080/dbproj/user', 'get');
	expect(response.status).toBe(200);
	const posts = response.data;
	//expect(posts).toHaveLength(3);
	//await server_service.deletePost(post1.id);
});

/*
test('Should save a post', async function () {
	const data = { username: generate(), email: generate(), password: generate() };
	const response = await request('http://localhost:3000/posts', 'post', data);
	expect(response.status).toBe(201);
	const post = response.data;
	expect(post.title).toBe(data.title);
	expect(post.content).toBe(data.content);
	await server_service.deletePost(post.id);
});

*/
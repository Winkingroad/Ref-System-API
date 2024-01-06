const superTest = require('supertest');
const app = require('../server.js');

// Function to generate a random username
const generateRandomUsername = () => {
    const randomSuffix = Math.random().toString(36).substring(7);
    return `newuser_${randomSuffix}`;
};

let authToken = '';

describe('Test the user registration path', () => {
    let generatedUsername = ''; 

    test('It should respond to the POST method', async () => {
        const response = await superTest(app).post('/api/register');
        expect(response.statusCode).toBe(400);
    });

    test('It should give an error if username is not provided', async () => {
        const response = await superTest(app).post('/api/register').send({ password: 'password' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username is required');
    });

    test('It should give an error if password is not provided', async () => {
        const response = await superTest(app).post('/api/register').send({ username: 'username' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Password must be at least 6 characters long');
    });

    test('It should give an error if username is already taken', async () => {
        const response = await superTest(app).post('/api/register').send({ username: 'username', password: 'password' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    test('It should register a new user', async () => {
        generatedUsername = generateRandomUsername(); // Generate a new random username
        const response = await superTest(app).post('/api/register').send({ username: generatedUsername, password: 'password' });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    
    describe('Test the user login path', () => {
        test('It should respond to the POST method', async () => {
            const response = await superTest(app).post('/api/login');
            expect(response.statusCode).toBe(400);
        });

        test('It should give an error if username is not provided', async () => {
            const response = await superTest(app).post('/api/login').send({ password: 'password' });
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error', 'Username is required');
        });

        test('It should give an error if password is not provided', async () => {
            const response = await superTest(app).post('/api/login').send({ username: 'username' });
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error', 'Password is required');
        });

        test('It should give an error if username is not registered', async () => {
            const response = await superTest(app).post('/api/login').send({ username: 'nonexistentuser', password: 'password' });
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        test('It should login a user', async () => {
            const response = await superTest(app).post('/api/login').send({ username: generatedUsername, password: 'password' });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('token');
            authToken = response.body.token;
        });
    });
});

describe('Test user register with referral path', () => {
    let generatedUsername = '';
    test('It should respond to the POST method', async () => {
        const response = await superTest(app).post('/api/referral/verify');
        expect(response.statusCode).toBe(400);
    });

    test('It should give an error if username is not provided', async () => {
        const response = await superTest(app).post('/api/referral/verify').send({ password: 'password', referralLink: 'referralLink' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username is required');
    });

    test('It should give an error if password is not provided', async () => {
        const response = await superTest(app).post('/api/referral/verify').send({ username: 'username', referralLink: 'referralLink' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Password must be at least 6 characters long');
    });

    test('It should give an error if referral link is not provided', async () => {
        const response = await superTest(app).post('/api/referral/verify').send({ username: 'username', password: 'password' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Referal code is empty');
    });

    test('It should give an error if username is already taken', async () => {
        const response = await superTest(app).post('/api/referral/verify').send({ username: 'username', password: 'password', referralLink: 'referralLink' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'User already registered');
    });

    test('It should register a new user with referral', async () => {
        generatedUsername = generateRandomUsername(); 
        const response = await superTest(app).post('/api/referral/verify').send({ username: generatedUsername, password: 'password', referralLink: 'referralLink' });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully');
    });
});

describe('Test the add balance path', () => {
    test('It should respond to the POST method', async () => {
        const response = await superTest(app).post('/api/add-balance');
        expect(response.statusCode).toBe(400);
    });

    test('It should give an error if username is not provided', async () => {
        const response = await superTest(app).post('/api/add-balance').send({ amount: 100 });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username is required');
    });

    test('It should give an error if amount is not provided', async () => {
        const response = await superTest(app).post('/api/add-balance').send({ username: 'username' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Amount must be a number');
    });

    test('It should give an error if username is not registered', async () => {
        const response = await superTest(app).post('/api/add-balance').send({ username: 'nonexistentuser', amount: 100 });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('It should add balance to a user', async () => {
        const response = await superTest(app).post('/api/add-balance').send({ username: 'username', amount: 100 });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Balance added successfully');
    });
});

describe('Test the generate referral link path', () => {
    test('It should respond to the GET method', async () => {
        const response = await superTest(app).get('/api/referral/generate').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
    });
    test('It should generate a referral link', async () => {
        const response = await superTest(app).get('/api/referral/generate').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('referralLink');       
    });
    test('It should give a message that Too many requests from this IP, please try again later', async () => {
        const maxRequests = 10;
        const requests = Array.from({ length: maxRequests }).map(async () => {
            const response = await superTest(app)
                .get('/api/referral/generate')
                .set('Authorization', `Bearer ${authToken}`);
            return response;
        });
    
        // Execute all requests concurrently using Promise.all
        const responses = await Promise.all(requests);
    
        // Log the response bodies for debugging
        responses.forEach((response, index) => {
            console.log(`Response ${index + 1}:`, response.body);
        });
    
        // The last request will exceed the rate limit
        const lastResponse = responses[responses.length - 1];
        expect(lastResponse.statusCode).toBe(429);
        expect(lastResponse.body).toHaveProperty('error', 'Too many requests from this IP, please try again later');
    });
    
    
});

describe('Test the get balance path', () => {
    test('It should respond to the GET method', async () => {
        const response = await superTest(app).get('/api/balance').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
    });
    test('It should get the balance of a user', async () => {
        const response = await superTest(app).get('/api/balance').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('balance');       
    });
});

describe('Test the expire referral link path', () => {
    test('It should respond to the POST method', async () => {
        const response = await superTest(app).post('/api/referral/expire');
        expect(response.statusCode).toBe(400);
    });
    test('It should give an error if username is not provided', async () => {
        const response = await superTest(app).post('/api/referral/expire').send({ });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username is required');
    });
    test('It should give an error if username is not registered', async () => {
        const response = await superTest(app).post('/api/referral/expire').send({ username: 'nonexistentuser' });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });
    test('It should expire the referral link of a user', async () => {
        const response = await superTest(app).post('/api/referral/expire').send({ username: 'username' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Referral link expired successfully');       
    });
});

describe('Test the get user profile path', () => {
    test('It should respond to the GET method', async () => {
        const response = await superTest(app).get('/api/myProfile').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
    });
    test('It should get the profile of a user', async () => {
        const response = await superTest(app).get('/api/myProfile').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('user');       
    });
});

describe('Test the get all users path', () => {
    test('It should respond to the GET method', async () => {
        const response = await superTest(app).get('/api/users').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
    });
    test('It should give an error if user is not admin', async () => {
        const response = await superTest(app).get('/api/users').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty('error', 'Unauthorized access');       
    });
});

describe('Test the get user by id path', () => {
    test('It should respond to the GET method', async () => {
        const response = await superTest(app).get('/api/users/1').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
    });
    test('It should give an error if user is not admin', async () => {
        const response = await superTest(app).get('/api/users/1').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty('error', 'Unauthorized access');       
    });
});

describe('Test the update user balance path', () => {
    test('It should respond to the PUT method', async () => {
        const response = await superTest(app).put('/api/users/1').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
    });
    test('It should give an error if user is not admin', async () => {
        const response = await superTest(app).put('/api/users/1').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty('error', 'Unauthorized access');       
    });
});

describe('Test the expire referral link by id path', () => {
    test('It should respond to the PUT method', async () => {
        const response = await superTest(app).put('/api/referral/expire/1').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
    });
    test('It should give an error if user is not admin', async () => {
        const response = await superTest(app).put('/api/referral/expire/1').set('Authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty('error', 'Unauthorized access');       
    });
});

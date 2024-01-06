const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const { validationResult } = require('express-validator');

const { registerUser, loginUser, registerWithReferral, addBalance, generateReferralLink, getBalance , expireReferralLink, getUserProfile, getAllUsers, getUserById , updateUserBalance, expireReferralLinkAdmin} = require('./userControllers.js');

jest.mock('../models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

describe('registerUser', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { username: 'test', password: 'test' } };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });
    test('should return 400 if validation error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
        await registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
    test('should return 400 if username already exists', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue({ username: 'test' });
        await registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'Username already exists' });
    });
    test('should return 500 if error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue(null);
        User.mockReturnValue({ save: () => { throw new Error('error'); } });
        await registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ error: 'Failed to register user' });
    });
    test('should return 201 if user registered successfully', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue(null);
        User.mockReturnValue({ save: () => { } });
        await registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });
});

describe('loginUser', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { username: 'test', password: 'test' } };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });
    test('should return 400 if validation error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
    test('should return 404 if user not found', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue(null);
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ error: 'User not found' });
    });
    test('should return 401 if invalid password', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue({ password: 'test' });
        bcrypt.compare.mockReturnValue(false);
        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: 'Invalid password' });
    });
    test('should return token if login successful', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue({ password: 'test' });
        bcrypt.compare.mockReturnValue(true);
        jwt.sign.mockReturnValue('token');
        await loginUser(req, res);
        expect(res.send).toHaveBeenCalledWith({ token: 'token' });
    });
});

describe('registerWithReferral', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { username: 'test', password: 'test', referralLink: 'test' } };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });
    test('should return 400 if validation error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
        await registerWithReferral(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
    test('should return 400 if username already exists', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue({ username: 'test' });
        await registerWithReferral(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'User already registered' });
    });
    test('should return 500 if error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue(null);
        User.mockReturnValue({ save: () => { throw new Error('error'); } });
        await registerWithReferral(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ error: 'Failed to register user' });
    });
    test('should return 201 if user registered successfully', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue(null);
        User.mockReturnValue({ save: () => { } });
        await registerWithReferral(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });
});
describe('addBalance', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { username: 'test', amount: 10 } };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });
    test('should return 400 if validation error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
        await addBalance(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
    test('should return 500 if error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOneAndUpdate.mockImplementation(() => { throw new Error('error'); });
        await addBalance(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ error: 'Failed to add balance' });
    });
    test('should return 200 if balance added successfully', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOneAndUpdate.mockReturnValue({ balance: 20 });
        await addBalance(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ message: 'Balance added successfully' });
    });
});

describe('generateReferralLink', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { headers: { authorization: "Bearer token" }, body: {} };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });
    test('should return 400 if validation error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
        await generateReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
    test('should return 404 if user not found', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        jwt.verify.mockReturnValue({ userId: 'userId' });
        User.findOne.mockReturnValue(null);
        await generateReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ error: 'User not found' });
    });
    test('should return 500 if error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        jwt.verify.mockReturnValue({ userId: 'userId' });
        User.findOne.mockReturnValue({ save: () => { throw new Error('error'); } });
        await generateReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ error: 'Failed to generate referral link' });
    });
    test('should return 200 if referral link generated successfully', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        jwt.verify.mockReturnValue({ userId: 'userId' });
        User.findOne.mockReturnValue({ save: () => { } });
        await generateReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ referralLink: expect.any(String) });
    });
});

describe('getBalance', () => {
    let req;
    let res;
  
    beforeEach(() => {
      req = {
        body: { amount: 10 },
        headers: { authorization: 'Bearer token' },
      };
      res = {
        status: jest.fn(() => res),
        send: jest.fn(),
      };
    });
  
    test('should return 400 if validation error', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'error' }],
      });
      await getBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
  
    test('should return 404 if user not found', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      jwt.verify.mockReturnValue({ userId: 'userId' });
      User.findOne.mockReturnValue(null);
      await getBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ error: 'User not found' });
    });
  
    test('should return 500 if error', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      jwt.verify.mockImplementation(() => {
        throw new Error('error');
      });
      await getBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: 'Failed to get balance' });
    });
  
    test('should return 200 if balance fetched successfully', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      jwt.verify.mockReturnValue({ userId: 'userId' });
      User.findOne.mockReturnValue({ balance: 20 });
      await getBalance(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ balance: 20 });
    });
  });

  describe('expireReferralLink', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { username: 'testUser' } };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });
    test('should return 400 if validation error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
        await expireReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ error: 'error' });
    });
    test('should return 404 if user not found', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue(null);
        await expireReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ error: 'User not found' });
    });
    test('should return 500 if error', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockImplementation(() => { throw new Error('error'); });
        await expireReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ error: 'Failed to expire referral link' });
    });
    test('should return 200 if referral link expired successfully', async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        User.findOne.mockReturnValue({ username: 'testUser' });
        User.findOneAndUpdate.mockReturnValue({ referralLink: null, referralExpiry: null });
        await expireReferralLink(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ message: 'Referral link expired successfully' });
    });
});

describe('getUserProfile', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { headers: { authorization: "Bearer token" }, body: {} };
        res = { status: jest.fn(() => res), send: jest.fn() };
    });

    test('should return 404 if user not found', async () => {
        jwt.verify.mockReturnValue({ userId: 'testUserId' });
        User.findOne.mockReturnValue(null);
        await getUserProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ error: 'User not found' });
    });
    test('should return 500 if error', async () => {
        jwt.verify.mockReturnValue({ userId: 'testUserId' });
        User.findOne.mockImplementation(() => { throw new Error('error'); });
        await getUserProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ error: 'Failed to get user profile' });
    });
    test('should return 200 if user profile fetched successfully', async () => {
        jwt.verify.mockReturnValue({ userId: 'testUserId' });
        User.findOne.mockReturnValue({ username: 'testUser' });
        await getUserProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ user: { username: 'testUser' } });
    });
});

describe('getAllUsers', () => {
    let req;
    let res;
    beforeEach(() => {
        req = {};
        res = { status: jest.fn(() => res), json: jest.fn() };
    });

    test('should return 500 if error', async () => {
        User.find.mockImplementation(() => { throw new Error('error'); });
        await getAllUsers(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch users' });
    });

    test('should return users if fetched successfully', async () => {
        const mockUsers = [{ username: 'user1', balance: 100, referralLink: 'link1', referralCount: 5 }];
        User.find.mockReturnValue(mockUsers);
        await getAllUsers(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ users: mockUsers });
    });
});

describe('getUserById', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { params: { userId: '123' } };
        res = { status: jest.fn(() => res), json: jest.fn() };
    });

    test('should return 500 if error', async () => {
        User.findOne.mockImplementation(() => { throw new Error('error'); });
        await getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch user' });
    });

    test('should return 404 if user not found', async () => {
        User.findOne.mockReturnValue(null);
        await getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should return user if fetched successfully', async () => {
        const mockUser = { username: 'testUser', balance: 50, referralLink: 'testLink', referralCount: 2 };
        User.findOne.mockReturnValue(mockUser);
        await getUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });
});

describe('updateUserBalance', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { params: { userId: '123' }, body: { newBalance: 200 } };
        res = { status: jest.fn(() => res), json: jest.fn() };
    });

    test('should return 500 if error', async () => {
        User.findOne.mockImplementation(() => { throw new Error('error'); });
        await updateUserBalance(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update user balance' });
    });

    test('should return 404 if user not found', async () => {
        User.findOne.mockReturnValue(null);
        await updateUserBalance(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should update user balance successfully', async () => {
        const mockUser = { username: 'testUser', balance: 100, referralLink: 'testLink', referralCount: 2, save: jest.fn() };
        User.findOne.mockReturnValue(mockUser);
        await updateUserBalance(req, res);
        expect(mockUser.balance).toBe(200);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'User balance updated successfully' });
    });
});

describe('expireReferralLinkAdmin', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { params: { userId: '123' } };
        res = { status: jest.fn(() => res), json: jest.fn() };
    });

    test('should return 500 if error', async () => {
        User.findOne.mockImplementation(() => { throw new Error('error'); });
        await expireReferralLinkAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to expire referral link' });
    });

    test('should return 404 if user not found', async () => {
        User.findOne.mockReturnValue(null);
        await expireReferralLinkAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should expire referral link successfully', async () => {
        const mockUser = { username: 'testUser', balance: 100, referralLink: 'testLink', referralCount: 2, save: jest.fn() };
        User.findOne.mockReturnValue(mockUser);
        await expireReferralLinkAdmin(req, res);
        expect(mockUser.referralLink).toBeNull();
        expect(mockUser.referralExpiry).toBeNull();
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Referral link expired successfully' });
    });
});






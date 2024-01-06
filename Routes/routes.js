const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userControllers.js');
const { authorizeAdmin } = require('../middleware/authMiddleware.js');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 12, // register than login than 10 times referal genration
    message: 'Too many requests from this IP, please try again later',
});
const handleRateLimitError = (req, res, next) => {
    if (req.rateLimit.remaining === 0) {
      return res.status(429).json({ error: 'Too many requests from this IP, please try again later' });
    }
    next();
  };

router.post('/register',[body('username').notEmpty().withMessage('Username is required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')], userController.registerUser);
router.post('/login',[body('username').notEmpty().withMessage('Username is required'), body('password').notEmpty().withMessage('Password is required')], userController.loginUser);
router.post('/referral/verify', [body('username').notEmpty().withMessage('Username is required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),body('referralLink').notEmpty().withMessage('Referal code is empty')], userController.registerWithReferral);
router.post('/add-balance', [body('username').notEmpty().withMessage('Username is required'), body('amount').isNumeric().withMessage('Amount must be a number')], userController.addBalance);
router.post('/referral/expire', [body('username').notEmpty().withMessage('Username is required')], userController.expireReferralLink);
router.get('/referral/generate',limiter, handleRateLimitError, userController.generateReferralLink);
router.get('/balance', userController.getBalance);
router.get('/myProfile', userController.getUserProfile);
router.get('/users', authorizeAdmin, userController.getAllUsers);
router.get('/users/:userId', authorizeAdmin, userController.getUserById);
router.put('/users/:userId', authorizeAdmin, userController.updateUserBalance);
router.put('/referral/expire/:userId', authorizeAdmin, userController.expireReferralLinkAdmin);
module.exports = router;

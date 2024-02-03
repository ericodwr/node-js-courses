const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter the vaild email!')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc)
            return Promise.reject(
              'E-mail already exists, please pick a different one!',
            );
        });
      }),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters!',
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password have not match!');
      } else {
        return true;
      }
    }),
  ],
  authController.postSignUp,
);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;

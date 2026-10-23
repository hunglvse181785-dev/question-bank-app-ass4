const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const { createToken } = require('../authenticate');

const scrypt = promisify(crypto.scrypt);

exports.register = async function (req, res, next) {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || password.length < 8) {
      const error = new Error('Username is required and password must be at least 8 characters');
      error.status = 400;
      return next(error);
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = (await scrypt(password, passwordSalt, 64)).toString('hex');
    const user = await User.create({
      username,
      passwordHash,
      passwordSalt,
      admin: false
    });

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        admin: user.admin
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = 'Username already exists';
    }

    next(error);
  }
};

exports.login = async function (req, res, next) {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const user = await User.findOne({ username })
      .select('+passwordHash +passwordSalt');

    if (!user) {
      const error = new Error('Username or password is incorrect');
      error.status = 401;
      return next(error);
    }

    const passwordHash = (await scrypt(password, user.passwordSalt, 64)).toString('hex');
    const supplied = Buffer.from(passwordHash, 'hex');
    const stored = Buffer.from(user.passwordHash, 'hex');

    if (supplied.length !== stored.length || !crypto.timingSafeEqual(supplied, stored)) {
      const error = new Error('Username or password is incorrect');
      error.status = 401;
      return next(error);
    }

    res.json({
      token: createToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        admin: user.admin
      }
    });
  } catch (error) {
    next(error);
  }
};

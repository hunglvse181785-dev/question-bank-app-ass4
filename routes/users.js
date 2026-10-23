const express = require('express');
const User = require('../models/User');
const { verifyUser, verifyAdmin } = require('../authenticate');
const router = express.Router();

router.get('/', verifyUser, verifyAdmin, async function (req, res, next) {
  try {
    const users = await User.find().select('username admin createdAt updatedAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

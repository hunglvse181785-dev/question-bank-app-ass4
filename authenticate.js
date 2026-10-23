const crypto = require('crypto');
const User = require('./models/User');
const Question = require('./models/Question');

const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000;

function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getTokenSecret() {
  if (!process.env.AUTH_TOKEN_SECRET) {
    throw makeError(500, 'AUTH_TOKEN_SECRET is not configured');
  }

  return process.env.AUTH_TOKEN_SECRET;
}

function sign(payload) {
  return crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest('base64url');
}

exports.createToken = function (userId) {
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId),
    exp: Date.now() + TOKEN_LIFETIME_MS
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
};

exports.verifyUser = async function (req, res, next) {
  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return next(makeError(401, 'Authentication token is required'));
  }

  try {
    const parts = match[1].split('.');

    if (parts.length !== 2) {
      return next(makeError(401, 'Invalid authentication token'));
    }

    const [payload, suppliedSignature] = parts;
    const expectedSignature = sign(payload);
    const suppliedBuffer = Buffer.from(suppliedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      return next(makeError(401, 'Invalid authentication token'));
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    if (!decoded.sub || !Number.isFinite(decoded.exp) || decoded.exp <= Date.now()) {
      return next(makeError(401, 'Authentication token has expired'));
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(makeError(401, 'User for this token was not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.status) {
      return next(error);
    }

    if (error instanceof SyntaxError) {
      return next(makeError(401, 'Invalid authentication token'));
    }

    next(error);
  }
};

exports.verifyAdmin = function (req, res, next) {
  if (!req.user) {
    return next(makeError(401, 'Authentication token is required'));
  }

  if (!req.user.admin) {
    return next(makeError(
      403,
      'You are not authorized to perform this operation!'
    ));
  }

  next();
};

exports.verifyAuthor = async function (req, res, next) {
  try {
    if (!req.user) {
      return next(makeError(401, 'Authentication token is required'));
    }

    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(makeError(404, 'Question not found'));
    }

    if (!question.author || !question.author.equals(req.user._id)) {
      return next(makeError(403, 'You are not the author of this question'));
    }

    req.question = question;
    next();
  } catch (error) {
    next(error);
  }
};

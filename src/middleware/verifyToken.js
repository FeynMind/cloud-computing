
import admin from '../config/firebase-config.js';

const verifyFirebaseToken = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      [, token] = req.headers.authorization.split(' ');
    }

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Please log in to get access.',
      });
    }

    const authToken = await admin.auth().verifyIdToken(token);
    if (authToken) {
      req.user = authToken;
      return next();
    }

    return res.status(401).json({
      status: 401,
      message: 'Please log in to get access.',
    });
  } catch (error) {
    console.log(error);
    let message = 'The token is invalid.';
    switch (error.code) {
      case 'auth/id-token-expired':
        message = 'The token is expired.';
        break;
      default:
        message = 'The token is invalid.';
    }

    return res.status(400).send({
      status: 400,
      message,
    });
  }
};

export default verifyFirebaseToken;

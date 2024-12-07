<<<<<<< HEAD
import jwt from 'jsonwebtoken';
=======
import admin from '../config/firebase-config.js';
>>>>>>> 513434731d06da405e6080df9b85463578647bf6

const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    let token;
    
    // Cek apakah token ada di header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      [, token] = req.headers.authorization.split(' ');
    }

<<<<<<< HEAD
    // Jika tidak ada token
=======
    console.log('Received Token:', token); // Log the received token for debugging

    // If no token is found, return an unauthorized error
>>>>>>> 513434731d06da405e6080df9b85463578647bf6
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Authorization token not found. Please log in to get access.',
      });
    }

<<<<<<< HEAD
    // Verifikasi JWT menggunakan secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Jika token valid, masukkan informasi user ke dalam request
    req.user = decodedToken;
    return next();

  } catch (error) {
    console.log(error);
    let message = 'The token is invalid or expired.';

    // Penanganan error untuk token yang kedaluwarsa atau invalid
    if (error instanceof jwt.TokenExpiredError) {
      message = 'The token is expired.';
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'The token is invalid.';
=======
    // Verify the token using Firebase Admin SDK
    const authToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded Token:', authToken); // Log decoded token details

    // Attach user information to the request object for use in controllers
    if (authToken) {
      req.user = {
        uid: authToken.uid,
        email: authToken.email,
        name: authToken.name || authToken.displayName,
      };
      return next(); // Proceed to the next middleware or controller
    }

    // If the token cannot be decoded, return an error
    return res.status(401).json({
      status: 401,
      message: 'Please log in to get access.',
    });
  } catch (error) {
    console.error('Token Verification Error:', error); // Log error details

    // Handle specific token-related errors from Firebase
    let message = 'The token is invalid.';
    switch (error.code) {
      case 'auth/id-token-expired':
        message = 'The token is expired.';
        break;
      case 'auth/argument-error':
        message = 'Invalid token format.';
        break;
      default:
        message = 'The token is invalid.';
>>>>>>> 513434731d06da405e6080df9b85463578647bf6
    }

    return res.status(400).json({
      status: 400,
      message,
    });
  }
};

export default verifyToken;

import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Cek apakah token ada di header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      [, token] = req.headers.authorization.split(' ');
    }

    // Jika tidak ada token
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Please log in to get access.',
      });
    }

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
    }

    return res.status(400).json({
      status: 400,
      message,
    });
  }
};

export default verifyToken;

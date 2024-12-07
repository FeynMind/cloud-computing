import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Timestamp } from 'firebase-admin/firestore';
import admin from '../config/firebase-config.js';
import userRepository from '../Data/userRepository.js';
import { ValidationError } from '../utils/appErrors.js';

class AuthController {
  // signup dengan email dan password
  async signup(req, res) {
    try {
<<<<<<< HEAD
      const { email, password, name } = req.body;
=======
      const {
        email,
        password,
        name,
        birthDate,
        class: userClass,
      } = req.body;
>>>>>>> 513434731d06da405e6080df9b85463578647bf6

      // Validasi input
      if (!email || !password || !name) {
        throw new ValidationError('Email, password, and name are required.');
      }

<<<<<<< HEAD
      // Buat user di Firebase Authentication
=======
      if (!password) {
        throw new ValidationError('Password is required.');
      }

      if (!name) {
        throw new ValidationError('Name is required.');
      }

      if(!birthDate) {
        throw new ValidationError('Birth Date is required.');
      }

      if(!userClass) {
        throw new ValidationError('Class is required.');
      }

      // Buat user di firebase Authentication
>>>>>>> 513434731d06da405e6080df9b85463578647bf6
      const createdAt = Timestamp.now();
      const updatedAt = createdAt;

      const user = await admin.auth().createUser({
        email,
        password,
        emailVerified: true,
        displayName: name,
        disabled: false,
      });

      // Save user to Firestore
      await userRepository.create({
        uid: user.uid,
        email,
        password: await bcrypt.hash(password, 10),
        name,
        birthDate,
        class: userClass,
        createdAt,
        updatedAt,
      }, email);

      return res.status(201).json({
        status: 201,
        message: 'Account created successfully, please log in.',
        user: {
          email: user.email,
          name: user.displayName,
          birthDate,
          class: userClass,
          createdAt,
        },
      });
    } catch (error) {
      console.log(error);
      let message = 'Failed to signup, please try again.';
      
      if (error instanceof ValidationError) {
        message = error.message;
      } else if (error.code === 'auth/email-already-exists') {
        message = 'The email address is already in use by another account.';
      }

      return res.status(400).json({
        status: 400,
        message,
      });
    }
  }

  // login dengan email dan password
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validasi input
      if (!email || !password) {
        throw new ValidationError('Email and password are required.');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: 'User not found.',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: 'Invalid password.',
        });
      }

      // Create Bearer token using JWT
      const bearerToken = jwt.sign(
        { uid: user.uid, email: user.email, name: user.name },
        process.env.JWT_SECRET, // Secret key used to sign the token
        { expiresIn: '1h' } // Token expiration time
      );

      return res.status(200).json({
        status: 200,
        message: 'Login successful.',
        token: bearerToken, // JWT Bearer token
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: 'Login failed, please try again.',
      });
    }
  }

  // Login dengan Google Auth
  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;

      // Verifikasi Google ID token
      if (!idToken) {
        throw new ValidationError('Google ID Token is required.');
      }

      // Verifikasi ID Token menggunakan Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { email, name, uid } = decodedToken;

      let user = await userRepository.findByEmail(email);
      if (!user) {
        // Buat user jika belum ada
        const createdAt = Timestamp.now();
        const updatedAt = createdAt;

        user = {
          uid,
          email,
          name,
          createdAt,
          updatedAt,
        };

        // Simpan data user di Firestore
        await userRepository.create(user, email);
      }

      // Create Bearer token using JWT
      const bearerToken = jwt.sign(
        { uid: user.uid, email: user.email, name: user.name },
        process.env.JWT_SECRET, // Secret key used to sign the token
        { expiresIn: '1h' } // Token expiration time
      );

      return res.status(200).json({
        status: 200,
        message: 'Login with Google successful.',
        token: bearerToken, // JWT Bearer token
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: 'Login with Google failed, please try again.',
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          status: 400,
          message: 'Firebase ID token is required for logout.',
        });
      }

      // Verifikasi ID token untuk memastikan validitas
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;

      // Revoke refresh tokens untuk user
      await admin.auth().revokeRefreshTokens(uid);

      return res.status(200).json({
        status: 200,
        message: 'Logout successful. Tokens revoked.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Failed to logout, please try again.',
      });
    }
  }
}

export default new AuthController();

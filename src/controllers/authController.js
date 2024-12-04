import bcrypt from 'bcrypt';
import { Timestamp } from 'firebase-admin/firestore';
import admin from '../config/firebase-config.js';
import userRepository from '../Data/userRepository.js';
import { ValidationError } from '../utils/appErrors.js';

class AuthController {
  // signup dengan email dan password
  async signup(req, res) {
    try {
      const {
        email,
        password,
        name,
      } = req.body;

      // validation
      if (!email) {
        throw new ValidationError('Email is required.');
      }

      if (!password) {
        throw new ValidationError('Password is required.');
      }

      if (!name) {
        throw new ValidationError('Name is required.');
      }

      // Buat user di firebase Authentication
      const createdAt = Timestamp.now();
      const updatedAt = createdAt;

      const user = await admin.auth().createUser({
        email,
        password,
        emailVerified: true,
        displayName: name,
        disabled: false,
      });

      // save to firestore
      await userRepository.create({
        uid: user.uid,
        email,
        password: await bcrypt.hash(password, 10),
        name,
        createdAt,
        updatedAt,
      }, email);

      return res.status(201).json({
        status: 201,
        message: 'Account created successfully, please log in',
        user: {
          email: user.email,
          name: user.displayName,
          createdAt,
        },
      });
    } catch (error) {
      let message = 'Failed to signup, please try again.';

      if (error instanceof ValidationError) {
        message = error.message;
      } else {
        // Handle FirestoreError
        switch (error.code) {
          case 'auth/email-already-exists':
            message = 'The email address is already in use by another account.';
            break;
          case 'auth/invalid-phone-number':
            message = 'The phone format must be +62xxxxx.';
            break;
          default:
            message = 'Failed to signup, please try again.';
        }
      }

      console.log(error);

      return res.status(400).json({
        status: 400,
        message,
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validasi input
      if (!email || !password) {
        throw new ValidationError('Email and password are required.');
      }

      // Mencari user berdasarkan email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: 'User not found.',
        });
      }

      // Memverifikasi password menggunakan bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: 'Invalid password.',
        });
      }

      // Membuat token Firebase ID setelah login sukses
      const firebaseToken = await admin.auth().createCustomToken(user.uid);

      return res.status(200).json({
        status: 200,
        message: 'Login successful.',
        token: firebaseToken,
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

  // Login with Google Auth
  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;

      // Verify Google ID token
      if (!idToken) {
        throw new ValidationError('Google ID Token is required.');
      }

      // Verify ID Token using Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const { email, name, uid } = decodedToken;

      let user = await userRepository.findByEmail(email);
      if (!user) {
        // Create user if not exists
        const createdAt = Timestamp.now();
        const updatedAt = createdAt;

        user = {
          uid,
          email,
          name,
          createdAt,
          updatedAt,
        };
        
        // Store user data in Firestore
        await userRepository.create(user, email);
      }

      // Create Firebase ID token
      const firebaseToken = await admin.auth().createCustomToken(uid);

      return res.status(200).json({
        status: 200,
        message: 'Login with Google successful.',
        token: firebaseToken,
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
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({
          status: 400,
          message: 'User ID (uid) is required for logout.',
        });
      }

      // Revoke refresh tokens for the user
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

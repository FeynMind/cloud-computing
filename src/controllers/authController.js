import bcrypt from 'bcrypt';
import { ValidationError } from '../utils/appErrors.js';

let users = []; // Temporary

class AuthController {
  async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validasi input
      if (!email) {
        throw new ValidationError('Email is required.');
      }
      if (!password) {
        throw new ValidationError('Password is required.');
      }
      if (!name) {
        throw new ValidationError('Name is required.');
      }

      // Cek apakah email sudah terdaftar
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: 'Email already exists.',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan user di memori
      const newUser = {
        email,
        name,
        password: hashedPassword,
        createdAt: new Date(),
      };
      users.push(newUser);

      return res.status(201).json({
        status: 201,
        message: 'Account created successfully, please log in',
        user: {
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      let message = 'Failed to signup, please try again.';
      if (error instanceof ValidationError) {
        message = error.message;
      }
      return res.status(400).json({
        status: 400,
        message,
      });
    }
  }
}

export default new AuthController();

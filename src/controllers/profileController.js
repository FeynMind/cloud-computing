import bcrypt from 'bcrypt';
import admin from '../config/firebase-config.js';
import userRepository from '../Data/userRepository.js';
import { ValidationError } from '../utils/appErrors.js';
import verifyToken from '../middleware/verifyToken.js';

class ProfileController {
  // Fungsi untuk mengedit profile
  async editProfile(req, res) {
  try {
    const { email, name, newPassword } = req.body;

    // Ambil `uid` dari token yang sudah diverifikasi
    const uid = req.user.uid;

    const users = await userRepository.findById(uid);
    if (!users) {
      return res.status(404).json({
        status: 404,
        message: 'User not found.',
      });
    }

    // Cek apakah password baru diberikan
    let hashedPassword;
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update data pengguna di Firebase Auth
    const updatedUser = await admin.auth().updateUser(uid, {
      email: email || users.email,
      displayName: name || users.name,
    });

    // Update password jika ada perubahan
    if (newPassword) {
      await admin.auth().updateUser(uid, {
        password: newPassword,
      });
    }

    // Simpan perubahan di Firestore
    await userRepository.update(uid, {
      email: email || users.email,
      password: hashedPassword || users.password,
      name: name || users.name,
    });

    return res.status(200).json({
      status: 200,
      message: 'Profile updated successfully.',
      user: {
        email: updatedUser.email,
        name: updatedUser.displayName,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to update profile, please try again.',
    });
  }
}

  // Fungsi untuk menghapus akun
  async deleteAccount(req, res) {
    try {
      // Ambil `uid` dari token yang sudah diverifikasi
      const uid = req.user.uid;
  
      const users = await userRepository.findById(uid);
      if (!users) {
        return res.status(404).json({
          status: 404,
          message: 'User not found.',
        });
      }
  
      // Hapus akun di Firebase Auth
      await admin.auth().deleteUser(uid);
  
      // Hapus data pengguna di Firestore
      await userRepository.delete(uid);
  
      return res.status(200).json({
        status: 200,
        message: 'Account deleted successfully.',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: 'Failed to delete account, please try again.',
      });
    }
  }  
}

export default new ProfileController();
import bcrypt from 'bcrypt';
import admin from '../config/firebase-config.js';
import userRepository from '../Data/userRepository.js';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const editProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(3).max(50).optional(),
  newPassword: Joi.string().min(6).optional(),
});

class ProfileController {
  // Edit Profile
  async editProfile(req, res) {
    try {
      const { email, name, newPassword } = req.body;
      const uid = req.user.uid;
      const emailVerified = req.user.email;

      // Validasi input
      const { error } = editProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 400,
          message: `Validation Error: ${error.details[0].message}`,
        });
      }

      // Cari user di Firestore
      const users = await userRepository.findByEmail(emailVerified);
      if (!users) {
        return res.status(404).json({
          status: 404,
          message: 'User not found.',
        });
      }

      // Validasi email unik
      if (email && email !== users.email) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            status: 400,
            message: 'Email is already in use by another account.',
          });
        }
      }

      // Hash password baru (jika ada)
      let hashedPassword;
      if (newPassword) {
        const isSamePassword = await bcrypt.compare(newPassword, users.password);
        if (isSamePassword) {
          return res.status(400).json({
            status: 400,
            message: 'New password cannot be the same as the old password.',
          });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      // Sanitasi nama
      const sanitizedName = sanitizeHtml(name || users.name, { allowedTags: [], allowedAttributes: {} });

      // Update Firebase Auth
      const updatePayload = {
        email: email || users.email,
        displayName: sanitizedName,
        ...(newPassword && { password: newPassword }),
      };
      const updatedUser = await admin.auth().updateUser(uid, updatePayload);

      // Simpan perubahan di Firestore
      await userRepository.update(emailVerified, {
        email: email || users.email,
        password: hashedPassword || users.password,
        name: sanitizedName,
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
      console.error('Error in editProfile:', error.message, error.stack);

      return res.status(500).json({
        status: 500,
        message: `Failed to update profile: ${error.message}`,
      });
    }
  }

  // Delete Account
  async deleteAccount(req, res) {
    try {
      const uid = req.user.uid;
      const emailVerified = req.user.email;
  
      // Validasi keberadaan akun di Firestore menggunakan email sebagai ID
      const userRef = admin.firestore().collection('users').doc(emailVerified);
      const userSnapshot = await userRef.get();
      if (!userSnapshot.exists) {
        return res.status(404).json({
          status: 404,
          message: 'User not found in Firestore. Cannot delete account.',
        });
      }
  
      // Validasi keberadaan akun di Firebase Auth
      try {
        await admin.auth().getUser(uid);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          return res.status(404).json({
            status: 404,
            message: 'User not found in Firebase Auth. Cannot delete account.',
          });
        }
        throw authError;
      }
  
      // Hapus akun di Firebase Auth
      await admin.auth().deleteUser(uid);
  
      // Hapus data pengguna di Firestore
      await userRef.delete();
  
      return res.status(200).json({
        status: 200,
        message: 'Account deleted successfully.',
      });
    } catch (error) {
      console.error('Error in deleteAccount:', error.message, error.stack);
  
      return res.status(500).json({
        status: 500,
        message: 'Failed to delete account, please try again.',
      });
    }
  }  
}

export default new ProfileController();

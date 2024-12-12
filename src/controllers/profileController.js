import bcrypt from 'bcrypt';
import admin from '../config/firebase-config.js';
import userRepository from '../Data/userRepository.js';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const editProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(3).max(50).optional(),
  newPassword: Joi.string().min(6).optional(),
  userClass: Joi.string().regex(/^[0-9]+$/).optional().messages({
    "string.pattern.base": "Kelas hanya boleh berupa angka.",
  }),
  birthDate: Joi.date().max('now').optional().messages({
    "date.max": "Tanggal lahir tidak boleh di masa depan.",
  }),
  school: Joi.string().min(3).optional(),
});

class ProfileController {
  // Edit Profile
  async editProfile(req, res) {
    try {
      const { email, name, newPassword, userClass, birthDate, school } = req.body;
      const uid = req.user.uid;
      const emailVerified = req.user.email;
  
      // Validasi input
      const { error } = editProfileSchema.validate(req.body); // Perbarui schema untuk atribut baru
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
  
      const updatePayload = {}; // Untuk menyimpan atribut yang akan diubah
  
      // Validasi email unik jika diubah
      if (email && email !== users.email) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            status: 400,
            message: 'Email is already in use by another account.',
          });
        }
        updatePayload.email = email;
      }
  
      // Hash password baru (jika ada)
      if (newPassword) {
        const isSamePassword = await bcrypt.compare(newPassword, users.password);
        if (isSamePassword) {
          return res.status(400).json({
            status: 400,
            message: 'New password cannot be the same as the old password.',
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updatePayload.password = hashedPassword;
      }
  
      // Update nama jika diubah
      if (name && name !== users.name) {
        const sanitizedName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
        updatePayload.name = sanitizedName;
      }
  
      // Update atribut tambahan jika diubah
      if (userClass && userClass !== users.userClass) {
        updatePayload.kelas = userClass;
      }
  
      if (birthDate && birthDate !== users.birthDate) {
        updatePayload.birthDate = birthDate;
      }
  
      if (school && school !== users.school) {
        updatePayload.school = school;
      }
  
      // Update Firebase Auth (hanya jika email atau nama berubah)
      if (updatePayload.email || updatePayload.name) {
        const firebaseUpdatePayload = {
          ...(updatePayload.email && { email: updatePayload.email }),
          ...(updatePayload.name && { displayName: updatePayload.name }),
          ...(newPassword && { password: newPassword }),
        };
        await admin.auth().updateUser(uid, firebaseUpdatePayload);
      }
  
      // Simpan perubahan ke Firestore
      if (Object.keys(updatePayload).length > 0) {
        await userRepository.update(emailVerified, updatePayload);
      }
  
      return res.status(200).json({
        status: 200,
        message: 'Profile updated successfully.',
        updatedFields: updatePayload, // Berikan atribut yang diubah ke respons
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

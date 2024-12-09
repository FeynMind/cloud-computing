import BaseRepository from './baseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const snapshot = await this.collection.where('email', '==', email).get();
    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }

  async update(id, data) {
    const ref = this.collection.doc(id);

    // Periksa apakah email akan diubah
    if (data.email && data.email !== id) {
      // Ambil data lama
      const oldDoc = await ref.get();
      if (!oldDoc.exists) {
        throw new Error('User not found.');
      }

      const oldData = oldDoc.data();

      // Gabungkan data lama dengan data baru
      const updatedData = { ...oldData, ...data };

      // Buat dokumen baru dengan ID baru (email baru)
      const newRef = this.collection.doc(data.email);
      await newRef.set(updatedData);

      // Hapus dokumen lama
      await ref.delete();
    } else {
      // Jika email tidak berubah, update dokumen seperti biasa
      await ref.update(data);
    }
  }
}

export default new UserRepository();

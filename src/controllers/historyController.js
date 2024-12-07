import admin from '../config/firebase-config.js'; // Firebase config jika dibutuhkan

class HistoryController {
  // Endpoint untuk mendapatkan riwayat percakapan pengguna
  async getHistory(req, res) {
    try {
      const { userId } = req.params; // Mendapatkan userId dari parameter URL

      // Validasi input
      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: 'User ID is required.',
        });
      }

      // Mendapatkan data pengguna dari koleksi 'users'
      const userSnapshot = await admin.firestore().collection('users').doc(userId).get();

      if (!userSnapshot.exists) {
        return res.status(404).json({
          status: 404,
          message: 'User not found.',
        });
      }

      const user = userSnapshot.data();

      // Mengambil riwayat percakapan dari koleksi 'chatMessages' berdasarkan userId
      const chatMessagesSnapshot = await admin.firestore()
        .collection('chatMessages')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'asc')
        .get();

      const messages = [];
      chatMessagesSnapshot.forEach(doc => {
        messages.push(doc.data());
      });

      return res.status(200).json({
        status: 200,
        user,
        messages,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: 'Failed to retrieve history.',
      });
    }
  }
}

export default new HistoryController();

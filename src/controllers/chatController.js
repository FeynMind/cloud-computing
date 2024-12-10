import admin from '../config/firebase-config.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Sesuaikan nama bucket GCS Anda

// Konfigurasi multer untuk unggah file PDF
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf/;
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal 10 MB
});

class chatController {
  // Fungsi untuk mendapatkan daftar kelas
  async getClasses(req, res) {
    try {
      const classes = [
        "Kelas 10",
        "Kelas 11",
        "Kelas 12"
      ];
  
      console.log("Classes data:", classes); // Debug log
      return res.status(200).json({
        status: 200,
        message: "Classes retrieved successfully.",
        data: classes
      });
    } catch (error) {
      console.error("Error in getClasses:", error.message, error.stack); // Tambahkan stack trace
      return res.status(500).json({
        status: 500,
        message: "Failed to retrieve classes."
      });
    }
  }  
  
  // Fungsi untuk mendapatkan daftar topik berdasarkan kelas yang dipilih
  async getTopics(req, res) {
    try {
      const { className } = req.query;
  
      // Pastikan className valid
      if (!className) {
        return res.status(400).json({
          status: 400,
          message: "Class name is required."
        });
      }
  
      // Daftar topik berdasarkan kelas
      const topics = {
        "Kelas 10": [
          "Ruang Lingkup Biologi",
          "Sel",
          "Sel 2",
          "Keanekaragaman Hayati",
          "Sistem Klasifikasi",
          "Bakteri",
          "Protista",
          "Jamur",
          "Plantae",
          "Animalia"
        ],
        "Kelas 11": [
          "Jaringan Hewan",
          "Jaringan Tumbuhan",
          "Sistem Gerak pada Manusia",
          "Sistem Koordinasi",
          "Sistem Pencernaan pada Manusia",
          "Sistem Pernafasan",
          "Sistem Sirkulasi Manusia",
          "Sistem Ekskresi",
          "Sistem Pertahanan Tubuh",
          "Materi Genetik",
          "Metabolisme",
          "Pertumbuhan dan Perkembangan"
        ],
        "Kelas 12": [
          "Hereditas 2",
          "Pewarisan Sifat",
          "Mutasi",
          "Evolusi",
          "Bioteknologi",
          "Bioproses",
          "Psikotropika",
          "Penerapan Prinsip Reproduksi Manusia",
          "Ekosistem",
          "Perubahan Lingkungan",
          "Virus"
        ]
      };
  
      // Ambil topik untuk kelas yang diminta
      const selectedTopics = topics[className];
  
      if (!selectedTopics) {
        return res.status(404).json({
          status: 404,
          message: `No topics found for class: ${className}`
        });
      }
  
      return res.status(200).json({
        status: 200,
        message: `Topics for ${className} retrieved successfully.`,
        data: selectedTopics
      });
    } catch (error) {
      console.error("Error in getTopics:", error.message, error.stack);
      return res.status(500).json({
        status: 500,
        message: "Failed to retrieve topics."
      });
    }
  }  

    // Fungsi untuk menyimpan pilihan kelas dan topik
    async setTopicPreference(req, res) {
        try {
            const { className, topic } = req.body;
            const user = req.user; // Ambil user dari token JWT (gunakan UID atau email)
            
            console.log('Received data:', { className, topic, user });

            // Validasi input kelas dan topik
            // Ambil daftar topik yang sesuai dengan kelas yang dipilih
            const topicsResponse = await this.getTopics(req, res); // Panggil getTopics
            const topics = topicsResponse.data; // Ambil data topik dari response

            // Pastikan kelas yang dimasukkan valid
            if (!topics) {
                return res.status(400).json({
                    status: 400,
                    message: `Invalid class name: ${className}. Please provide a valid class name.`,
                });
            }

            // Validasi topik
            if (!topic || !topics.includes(topic)) {
                return res.status(400).json({
                    status: 400,
                    message: `Invalid topic for ${className}. Please provide a valid topic.`,
                });
            }

            // Simpan preferensi kelas dan topik ke Firestore
            const userPreference = {
                className,
                topic,
                updatedAt: admin.firestore.Timestamp.now(), // Gunakan timestamp Firestore
            };

            console.log('Saving user preference:', userPreference);

            // Pastikan menggunakan user.uid atau user.email sesuai dengan apa yang ada di req.user
            const userId = user.email || user.uid; // Gunakan email atau UID, tergantung yang Anda simpan dalam token JWT
            if (!userId) {
                return res.status(400).json({
                    status: 400,
                    message: 'User ID is missing in token.',
                });
            }

            // Menyimpan data preferensi ke Firestore
            await admin.firestore()
                .collection('users')
                .doc(userId) // Gunakan userId untuk ID dokumen
                .set({ topicPreference: userPreference }, { merge: true }); // Gunakan merge untuk update sebagian data

            return res.status(200).json({
                status: 200,
                message: 'Topic preference saved successfully.',
                data: userPreference,
            });
        } catch (error) {
            console.error('Error in setTopicPreference:', error); // Tampilkan error lengkap untuk debugging
            return res.status(500).json({
                status: 500,
                message: 'Failed to save topic preference.',
                error: error.message, // Kirimkan pesan error untuk debugging
            });
        }
    }

    async createNewSession(req, res) {
        try {
          const user = req.user; // User diambil dari token JWT
          if (!user || !user.uid) {
            return res.status(400).json({ status: 400, message: "Invalid user." });
          }
      
          const sessionId = `session-${Date.now()}`; // ID sesi baru
          const sessionData = {
            sessionId,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          };
      
          // Simpan sesi baru ke Firestore
          await admin.firestore().collection('sessions').doc(sessionId).set(sessionData);
      
          return res.status(200).json({
            status: 200,
            message: "New session created successfully.",
            data: sessionData,
          });
        } catch (error) {
          console.error("Error in createNewSession:", error.message);
          return res.status(500).json({ status: 500, message: "Failed to create session." });
        }
      }
      
      async inputTeks(req, res) {
        try {
          const { text, sessionId } = req.body;
      
          if (!text || !sessionId) {
            return res.status(400).json({
              status: 400,
              message: "Text input and sessionId are required.",
            });
          }
      
          const user = req.user; // Dapatkan user dari token JWT
          if (!user || !user.uid) {
            return res.status(400).json({
              status: 400,
              message: "User not found or invalid token.",
            });
          }
      
          // Data chat baru
          const chatId = `chat-${Date.now()}`;
          const chatData = {
            id: chatId,
            type: "text",
            content: text,
            role: "user",
            createdAt: new Date().toISOString(),
          };
      
          // Referensi ke session
          const sessionRef = admin.firestore().collection("chatSessions").doc(sessionId);
      
          // Cek apakah sesi sudah ada
          const sessionDoc = await sessionRef.get();
      
          if (!sessionDoc.exists) {
            // Jika sesi belum ada, buat dokumen baru
            const newSession = {
              sessionId,
              userId: user.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              chats: [chatData], // Tambahkan chat pertama ke array chats
            };
            await sessionRef.set(newSession);
          } else {
            // Jika sesi sudah ada, tambahkan chat baru ke array chats
            await sessionRef.update({
              chats: admin.firestore.FieldValue.arrayUnion(chatData),
              updatedAt: new Date().toISOString(),
            });
          }
      
          return res.status(200).json({
            status: 200,
            message: "Text input successfully saved.",
            data: chatData,
          });
        } catch (error) {
          console.error("Error in inputTeks:", error.message);
          return res.status(500).json({
            status: 500,
            message: "Failed to process text input.",
          });
        }
      }            
    
      async getChatHistory(req, res) {
        try {
          const { sessionId } = req.query;
      
          if (!sessionId) {
            return res.status(400).json({
              status: 400,
              message: "sessionId is required.",
            });
          }
      
          const sessionRef = admin.firestore().collection("chatSessions").doc(sessionId);
          const sessionDoc = await sessionRef.get();
      
          if (!sessionDoc.exists) {
            return res.status(404).json({
              status: 404,
              message: "Session not found.",
            });
          }
      
          const sessionData = sessionDoc.data();
      
          return res.status(200).json({
            status: 200,
            message: "Chat history retrieved successfully.",
            data: sessionData.chats || [],
          });
        } catch (error) {
          console.error("Error in getChatHistory:", error.message);
          return res.status(500).json({
            status: 500,
            message: "Failed to retrieve chat history.",
          });
        }
      }            

  // Fungsi untuk menerima input PDF
  async inputPDF(req, res) {
    upload.single('pdf')(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({
            status: 400,
            message: err.message || 'Failed to upload PDF.',
          });
        }

        const filePath = req.file.path;
        const originalFileName = req.file.originalname;

        // Unggah file PDF ke Google Cloud Storage
        const gcsFileName = `pdf/${Date.now()}-${originalFileName}`;
        await storage.bucket(bucketName).upload(filePath, {
          destination: gcsFileName,
          metadata: {
            contentType: 'application/pdf',
          },
        });

        // Simpan metadata file di database (Firestore)
        const user = req.user; // Dapatkan user dari token JWT
        const chatId = `${user.uid}-${Date.now()}`;
        const chatData = {
          chatId,
          type: 'pdf',
          content: gcsFileName,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        };

        await admin.firestore().collection('chats').doc(chatId).set(chatData);

        // Hapus file lokal setelah diunggah
        fs.unlinkSync(filePath);

        return res.status(200).json({
          status: 200,
          message: 'PDF uploaded and metadata saved successfully.',
          data: chatData,
        });
      } catch (error) {
        console.error('Error in inputPDF:', error.message);
        return res.status(500).json({
          status: 500,
          message: 'Failed to process PDF input.',
        });
      }
    });
  }
}

export default new chatController();
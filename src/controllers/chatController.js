import admin from '../config/firebase-config.js';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';

// Inisialisasi Google Cloud Storage
const storage = new Storage({
  keyFilename: './src/config/serviceAccountKey.json',
});
const bucketName = process.env.GCS_BUCKET_NAME;

// Konfigurasi Multer untuk memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // Maksimal 50 MB
});

class chatController {
  // Fungsi untuk mendapatkan daftar kelas
  async getClasses(req, res) {
    try {
      const classes = [
        "10",
        "11",
        "12"
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
        "10": [
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
        "11": [
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
        "12": [
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

  async setTopicPreference(req, res) {
    try {
        const { sessionId, className, topic } = req.body;
        const user = req.user; // Ambil user dari token JWT (gunakan UID atau email)

        if (!sessionId || !className || !topic) {
            return res.status(400).json({
                status: 400,
                message: "sessionId, className, and topic are required.",
            });
        }

        console.log("Received data:", { sessionId, className, topic, user });

        // Validasi kelas dan topik
        const topics = {
            "10": [
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
            "11": [
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
            "12": [
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

        const selectedTopics = topics[className];

        if (!selectedTopics || !selectedTopics.includes(topic)) {
            return res.status(400).json({
                status: 400,
                message: `Invalid topic for class ${className}. Please provide a valid topic.`,
            });
        }

        // Data preferensi yang akan disimpan
        const preferenceData = {
            className,
            topic,
            createdAt: new Date().toISOString(),
        };

        console.log("Preference data to save:", preferenceData);

        // Referensi ke dokumen sesi berdasarkan sessionId
        const sessionRef = admin.firestore().collection("chatSessions").doc(sessionId);

        // Periksa apakah sessionId sudah ada
        const sessionDoc = await sessionRef.get();
        if (!sessionDoc.exists) {
            // Jika sesi belum ada, buat sesi baru
            const newSession = {
                sessionId,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                preferences: preferenceData, // Simpan preferensi di field preferences
                chats: [], // Inisialisasi array chats kosong
            };

            await sessionRef.set(newSession);
        } else {
            // Jika sesi sudah ada, update data preferensi
            await sessionRef.update({
                preferences: preferenceData,
                updatedAt: new Date().toISOString(),
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Topic preference saved successfully.",
            data: preferenceData,
        });
    } catch (error) {
        console.error("Error in setTopicPreference:", error.message);
        return res.status(500).json({
            status: 500,
            message: "Failed to save topic preference.",
            error: error.message,
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

    async inputPDF(req, res) { 
      upload.single('pdf')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            status: 400,
            message: err.message || 'Failed to upload PDF.',
          });
        }
    
        try {
          const { file } = req;
          const { sessionId } = req.body; // Ambil sessionId dari body request
    
          if (!file) {
            return res.status(400).json({
              status: 400,
              message: 'No file uploaded. Please provide a valid PDF file.',
            });
          }
    
          if (!sessionId) {
            return res.status(400).json({
              status: 400,
              message: 'Session ID is required.',
            });
          }
    
          const originalFileName = file.originalname;
          const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          const gcsFileName = `input-pdf/${uniqueId}-${originalFileName}`;
          const user = req.user;
    
          // Unggah file PDF ke GCS
          const bucket = storage.bucket(bucketName);
          const blob = bucket.file(gcsFileName);
          const blobStream = blob.createWriteStream({
            metadata: {
              contentType: 'application/pdf',
            },
          });
    
          blobStream.on('error', (error) => {
            console.error('Blob stream error:', error);
            throw error;
          });
    
          blobStream.on('finish', async () => {
            console.log('File uploaded successfully to GCS:', gcsFileName);
    
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
    
            // Simpan metadata file di collection chatSessions terkait dengan sessionId
            const sessionRef = admin.firestore().collection('chatSessions').doc(sessionId);
            const sessionDoc = await sessionRef.get();
    
            if (!sessionDoc.exists) {
              return res.status(404).json({
                status: 404,
                message: 'Session not found.',
              });
            }
    
            // Data metadata PDF yang akan disimpan ke sesi
            const sessionData = {
              type: 'pdf',
              content: gcsFileName,
              fileUrl: publicUrl,
              userId: user.uid,
              createdAt: new Date().toISOString(),
            };
    
            // Update sesi dengan metadata file
            await sessionRef.update({
              chats: admin.firestore.FieldValue.arrayUnion(sessionData),
              updatedAt: new Date().toISOString(),
            });
    
            return res.status(200).json({
              status: 200,
              message: 'PDF uploaded and metadata saved to session successfully.',
              data: sessionData,
            });
          });
    
          blobStream.end(file.buffer);
        } catch (error) {
          console.error('Error in inputPDF:', error.message);
          return res.status(500).json({
            status: 500,
            message: error.message || 'Failed to process PDF input.',
          });
        }
      });
    }      
}

export default new chatController();
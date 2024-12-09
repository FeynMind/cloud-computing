import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/appErrors.js';  // Pastikan path sesuai

const app = express();

// Periksa dan buat folder jika belum ada
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads', 'pdf');

// Konfigurasi Multer untuk hanya menerima file PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Folder tujuan untuk menyimpan file
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname); // Ekstensi file
    const filename = `${timestamp}-${file.originalname}`; // Nama file unik
    cb(null, filename);
  },
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ValidationError('Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Maksimal 50MB
}).single('pdf');

// Middleware untuk autentikasi (menverifikasi token JWT)
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Mengambil token dari header Authorization
  
  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Menyimpan informasi user ke dalam request
    next();
  });
};

// Controller untuk menangani upload PDF
class PdfController {
  uploadPdf(req, res) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Error dari Multer
        return res.status(400).json({
          status: 400,
          message: 'Failed to upload file. ' + err.message,
        });
      } else if (err) {
        // Error custom
        return res.status(400).json({
          status: 400,
          message: err.message || 'Failed to upload file.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 400,
          message: 'No file uploaded. Please provide a valid PDF file.',
        });
      }

      // File berhasil diupload, kirim respons dengan data file dan pengguna
      return res.status(201).json({
        status: 201,
        message: 'File uploaded successfully.',
        file: {
          name: req.file.filename,
          path: req.file.path,
        },
        user: req.user, // Informasi pengguna yang login
      });
    });
  }
}

export default new PdfController();

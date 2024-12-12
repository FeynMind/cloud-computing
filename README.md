# FeynMind API
RESTful API made with Express JS and Firebase Firestore.

## Prerequisites
Node jS v20.11.1
Firebase Firestore
Google Cloud Storage

## Installation
```bash
npm i
```

## Usage
```bash
npm run start
npm run start-auto
```

## Dependencies
---
Dependency | Usage | Version
--- | --- | ---
@google-cloud/firestore | No SQL Database Based on Google Cloud | v13.0.1
@google-cloud/storage | Storing Model & File Input From CLient | v9.15.0
bcrypt | Hashing and salting passwords | v5.1.1
cors | CORS handling | v2.8.5
dotenv | Environment Variables Loader | v16.4.5
express | Backend Library | v4.21.1
joi | Schema Validation | v17.13.3
jsonwebtoken | Create and Verify JSON Web Tokens | v9.0.2
morgan | HTTP request logger | v1.10.0
multer | Middleware to handle `multipart/form-data` | v1.4.5-lts.1
nodemon | Auto-restart Server | v3.1.7
sanitize-html | HTML Cleaner | v2.13.1

## Routes
---
Routes| Method | Usage 
--- | --- | ---
`/api/v1` | GET | Protected Routes
`/api/v1/auth/signup` | POST | Create Account
`/api/v1/auth/login` | POST | Login to Acccount
`/api/v1/auth/logout` | POST | Logout From Account
`/api/v1/auth/google-login` | POST | Login With Google
`/api/v1/chat/uploadPDF` | POST | Input PDF From Client
`/api/v1/chat/inputTeks` | POST | Input Teks From Client
`/api/v1/chat/classses` | GET | Get Classes Information
`/api/v1/chat/topics` | GET | Get Topics Information
`/api/v1/chat/history` | GET | Get History From Chat
`/api/v1/chat/create-session` | POST | Create New Session From Chat
`/api/v1/chat/topic-preference` | POST | Choose Classes and Topic
`/api/v1/profile/edit` | PUT | Edit Client Profile
`/api/v1/profile/delete` | DELETE | Delete Client Profile

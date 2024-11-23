import admin from './firebase-config.js';

export default function db() {
  return admin.firestore();
}

import db from '../config/db.js';

export default class BaseRepository {
  constructor(collection) {
    this.collection = db().collection(collection);
  }

  async create(data, doc = null) {
    let res;
    if (doc) {
      res = await this.collection.doc(doc).set(data);
    } else {
      res = await this.collection.add(data);
    }

    return res;
  }

  async get() {
    const snapshot = await this.collection.orderBy('sort').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findById(id) {
    const ref = this.collection.doc(id);
    const doc = await ref.get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async delete(id) {
    await this.collection.doc(id).delete();
  }
}
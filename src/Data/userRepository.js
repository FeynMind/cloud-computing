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
}

export default new UserRepository();

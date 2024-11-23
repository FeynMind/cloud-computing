import BaseRepository from './baseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }
}

export default new UserRepository();
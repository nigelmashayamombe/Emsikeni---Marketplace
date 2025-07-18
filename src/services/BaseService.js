// src/services/BaseService.js
export default class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async findById(id) {
    const doc = await this.repository.findById(id);
    if (!doc) {
      throw new Error('Resource not found');
    }
    return doc;
  }

  async findAll(query = {}, options = {}) {
    return await this.repository.findAll(query, options);
  }

  async update(id, data) {
    const doc = await this.repository.update(id, data);
    if (!doc) {
      throw new Error('Resource not found');
    }
    return doc;
  }

  async delete(id) {
    const doc = await this.repository.delete(id);
    if (!doc) {
      throw new Error('Resource not found');
    }
    return doc;
  }
}

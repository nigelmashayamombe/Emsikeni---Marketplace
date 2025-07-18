// src/repositories/BaseRepository.js
const IRepository = require('../interfaces/IRepository');

class BaseRepository extends IRepository {
  constructor(model) {
    super();
    this.model = model;
  }

  async create(data) {
    const doc = new this.model(data);
    return await doc.save();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(query) {
    return await this.model.findOne(query);
  }

  async findAll(query = {}, options = {}) {
    const { page = 1, limit = 10, sort = {}, populate = [] } = options;
    const skip = (page - 1) * limit;

    let queryBuilder = this.model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Handle population
    if (populate.length > 0) {
      populate.forEach(field => {
        queryBuilder = queryBuilder.populate(field);
      });
    }

    const [docs, total] = await Promise.all([
      queryBuilder.exec(),
      this.model.countDocuments(query)
    ]);

    return {
      docs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async exists(query) {
    return await this.model.exists(query);
  }

  async count(query = {}) {
    return await this.model.countDocuments(query);
  }
}

module.exports = BaseRepository;
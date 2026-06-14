const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Intercept Mongoose Schema pre-hook registrations to support the mock database fallback
if (mongoose.Schema) {
  const originalPre = mongoose.Schema.prototype.pre;
  mongoose.Schema.prototype.pre = function(event, callback) {
    if (!this.preHooks) this.preHooks = {};
    this.preHooks[event] = callback;
    return originalPre.apply(this, arguments);
  };
}

let useMock = false;
const DATA_DIR = path.join(__dirname, '../data');

// Create mock database directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory storage cache for mock database
const mockCollections = {};

// Helper to load collection from JSON file
const loadCollection = (name) => {
  const filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`Error reading mock file ${filePath}:`, e);
      return [];
    }
  }
  return [];
};

// Helper to save collection to JSON file
const saveCollection = (name, data) => {
  const filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing mock file ${filePath}:`, e);
  }
};

// Mock Query Helper
class MockQuery {
  constructor(modelName, dataPromise) {
    this.modelName = modelName;
    this.promise = Promise.resolve(dataPromise);
    this.populatePaths = [];
    this.sortOption = null;
    this.limitCount = null;
  }

  populate(pathOption) {
    // pathOption can be string e.g. 'user' or object { path: 'volunteer', populate: { path: 'user' } }
    this.populatePaths.push(pathOption);
    return this;
  }

  select(selectOption) {
    return this;
  }

  sort(sortOption) {
    this.sortOption = sortOption;
    return this;
  }

  limit(limitCount) {
    this.limitCount = limitCount;
    return this;
  }

  async exec() {
    let results = await this.promise;
    
    // Sort
    if (this.sortOption && Array.isArray(results)) {
      const field = Object.keys(this.sortOption)[0];
      const direction = this.sortOption[field];
      results.sort((a, b) => {
        const valA = a[field] || '';
        const valB = b[field] || '';
        if (valA < valB) return direction === -1 ? 1 : -1;
        if (valA > valB) return direction === -1 ? -1 : 1;
        return 0;
      });
    }

    // Limit
    if (this.limitCount !== null && Array.isArray(results)) {
      results = results.slice(0, this.limitCount);
    }

    // Populate
    if (this.populatePaths.length > 0 && results) {
      const isArray = Array.isArray(results);
      const items = isArray ? results : [results];

      for (const item of items) {
        if (!item) continue;
        for (const p of this.populatePaths) {
          let refPath = '';
          let subPopulate = null;

          if (typeof p === 'string') {
            refPath = p;
          } else if (p && typeof p === 'object') {
            refPath = p.path;
            subPopulate = p.populate;
          }

          const refId = item[refPath];
          if (refId) {
            // Determine reference model
            let refModelName = '';
            if (refPath === 'user') refModelName = 'User';
            else if (refPath === 'volunteer') refModelName = 'Volunteer';
            else if (refPath === 'event') refModelName = 'Event';

            if (refModelName) {
              const refCollection = loadCollection(refModelName);
              const idStr = typeof refId === 'object' ? refId.toString() : String(refId);
              let refDoc = refCollection.find((doc) => String(doc._id) === idStr);
              if (refDoc) {
                // Instantiation
                const MockModel = mockModels[refModelName];
                let instantiatedDoc = new MockModel(refDoc);
                
                // Deep populate if needed
                if (subPopulate && instantiatedDoc) {
                  const subQuery = new MockQuery(refModelName, instantiatedDoc);
                  subQuery.populate(subPopulate);
                  instantiatedDoc = await subQuery.exec();
                }
                
                item[refPath] = instantiatedDoc;
              }
            }
          }
        }
      }
      results = isArray ? items : items[0];
    }

    return results;
  }

  then(onfulfilled, onrejected) {
    return this.exec().then(onfulfilled, onrejected);
  }
}

// Mock Model registry
const mockModels = {};

// Mock Schema class
class MockSchema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.preHooks = {};
    this.methods = {};
  }

  pre(event, callback) {
    this.preHooks[event] = callback;
    return this;
  }

  index(fields, options) {
    return this;
  }
}

// Check connection helper
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/naye-pankh';
    console.log(`Connecting to MongoDB at ${connStr}...`);
    
    // Set low timeout for fast local fallback check
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2500,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    useMock = false;
  } catch (error) {
    console.warn(`\n⚠️ Local MongoDB Connection Failed: ${error.message}`);
    console.warn(`🤖 ACTIVATING FILE-SYSTEM MOCK DATABASE FALLBACK (data saved in backend/data/)\n`);
    useMock = true;
  }
};

// Mock Document / Model class generator
const createMockModel = (modelName, schema) => {
  class MockModel {
    constructor(data = {}) {
      Object.assign(this, data);
      if (!this._id) {
        this._id = 'mock_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
      }
      if (!this.createdAt) {
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
      }
    }

    isModified(path) {
      return true;
    }

    toObject() {
      const obj = { ...this };
      // Remove mock function methods
      delete obj.save;
      delete obj.toObject;
      delete obj.matchPassword;
      return obj;
    }

    async save() {
      // Run pre-save hooks
      if (schema && schema.preHooks && schema.preHooks['save']) {
        await new Promise((resolve) => {
          schema.preHooks['save'].call(this, resolve);
        });
      }

      const collection = loadCollection(modelName);
      const index = collection.findIndex((d) => String(d._id) === String(this._id));
      
      this.updatedAt = new Date().toISOString();
      const plainData = this.toObject();

      if (index >= 0) {
        collection[index] = plainData;
      } else {
        collection.push(plainData);
      }

      saveCollection(modelName, collection);
      return this;
    }
  }

  // Add schema custom methods
  if (schema && schema.methods) {
    Object.assign(MockModel.prototype, schema.methods);
  }

  // Add Model Static Methods
  MockModel.find = (filter = {}) => {
    const collection = loadCollection(modelName);
    const filtered = collection.filter((item) => {
      for (const key in filter) {
        const filterVal = filter[key];
        const itemVal = item[key];
        
        // Handle regex matching
        if (filterVal && filterVal.$regex) {
          const regex = new RegExp(filterVal.$regex, filterVal.$options || '');
          if (!regex.test(itemVal || '')) return false;
          continue;
        }

        // Handle array member match $in
        if (filterVal && filterVal.$in) {
          const isMatch = filterVal.$in.some((inVal) => {
            if (inVal instanceof RegExp) {
              return (itemVal || []).some((v) => inVal.test(v));
            }
            return (itemVal || []).includes(inVal) || String(itemVal) === String(inVal);
          });
          if (!isMatch) return false;
          continue;
        }

        // Handle Date bounds
        if (filterVal && (filterVal.$gte || filterVal.$lte)) {
          const itemDate = new Date(itemVal).getTime();
          if (filterVal.$gte && itemDate < new Date(filterVal.$gte).getTime()) return false;
          if (filterVal.$lte && itemDate > new Date(filterVal.$lte).getTime()) return false;
          continue;
        }

        // Standard matches
        if (String(itemVal) !== String(filterVal)) return false;
      }
      return true;
    });

    const docs = filtered.map((d) => new MockModel(d));
    return new MockQuery(modelName, docs);
  };

  MockModel.findOne = (filter = {}) => {
    const collection = loadCollection(modelName);
    const found = collection.find((item) => {
      for (const key in filter) {
        const filterVal = filter[key];
        const itemVal = item[key];
        if (String(itemVal) !== String(filterVal)) return false;
      }
      return true;
    });
    
    const doc = found ? new MockModel(found) : null;
    return new MockQuery(modelName, doc);
  };

  MockModel.findById = (id) => {
    if (!id) return new MockQuery(modelName, null);
    const collection = loadCollection(modelName);
    const idStr = typeof id === 'object' ? id.toString() : String(id);
    const found = collection.find((item) => String(item._id) === idStr);
    const doc = found ? new MockModel(found) : null;
    return new MockQuery(modelName, doc);
  };

  MockModel.create = async (data) => {
    const instance = new MockModel(data);
    await instance.save();
    return instance;
  };

  MockModel.countDocuments = async (filter = {}) => {
    const query = MockModel.find(filter);
    const results = await query.exec();
    return results.length;
  };

  MockModel.deleteMany = async (filter = {}) => {
    const collection = loadCollection(modelName);
    if (Object.keys(filter).length === 0) {
      saveCollection(modelName, []);
      return { deletedCount: collection.length };
    }
    const remaining = collection.filter((item) => {
      for (const key in filter) {
        if (String(item[key]) === String(filter[key])) return false;
      }
      return true;
    });
    saveCollection(modelName, remaining);
    return { deletedCount: collection.length - remaining.length };
  };

  MockModel.findByIdAndDelete = async (id) => {
    const collection = loadCollection(modelName);
    const idStr = String(id);
    const index = collection.findIndex((item) => String(item._id) === idStr);
    if (index >= 0) {
      collection.splice(index, 1);
      saveCollection(modelName, collection);
      return { success: true };
    }
    return null;
  };

  MockModel.aggregate = async (pipeline = []) => {
    // Basic aggregation support for dashboard growth stats grouping
    const collection = loadCollection(modelName);
    
    // Group monthly registrations counts
    const countsByMonth = {};
    collection.forEach((item) => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        const monthNum = date.getMonth() + 1;
        countsByMonth[monthNum] = (countsByMonth[monthNum] || 0) + 1;
      }
    });

    const result = Object.keys(countsByMonth).map((m) => ({
      _id: Number(m),
      count: countsByMonth[m],
    }));

    return result;
  };

  mockModels[modelName] = MockModel;
  return MockModel;
};

// Wrapper module facade
class SchemaWrapper {
  constructor(definition, options) {
    if (useMock) {
      return new MockSchema(definition, options);
    }
    return new mongoose.Schema(definition, options);
  }
}
SchemaWrapper.Types = mongoose.Schema ? mongoose.Schema.Types : { ObjectId: String };

module.exports = {
  Schema: SchemaWrapper,
  Types: mongoose.Types ? mongoose.Types : { ObjectId: String },
  model: (name, schema) => {
    // If running in Mock mode, return MockModel class, else return standard Mongoose model
    if (useMock) {
      return createMockModel(name, schema);
    }
    
    // Compile mongoose model
    let compiledModel;
    try {
      compiledModel = mongoose.model(name);
    } catch (e) {
      compiledModel = mongoose.model(name, schema);
    }

    // Wrap methods to support runtime switching if database drops
    const wrappedModel = function(data) {
      if (useMock) {
        const MockModel = mockModels[name] || createMockModel(name, schema);
        return new MockModel(data);
      }
      return new compiledModel(data);
    };

    // Proxy static methods
    const staticMethods = [
      'find', 'findOne', 'findById', 'create', 
      'countDocuments', 'deleteMany', 'findByIdAndDelete', 'aggregate'
    ];

    staticMethods.forEach((method) => {
      wrappedModel[method] = function(...args) {
        if (useMock) {
          const MockModel = mockModels[name] || createMockModel(name, schema);
          return MockModel[method](...args);
        }
        return compiledModel[method](...args);
      };
    });

    // Compound indexes stub
    wrappedModel.schema = {
      index: () => {}
    };

    return wrappedModel;
  },
  connectDB,
  isMockActive: () => useMock,
};

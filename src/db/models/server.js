const mongoose = require('mongoose')

let s = {
  name: 'Server',
  schema: new mongoose.Schema({
    id: {
      type: String,
      unique: true
    },
    prefix: {
      type: String
    }
  }, {
    timestamps: true
  })
}

module.exports = mongoose.model(s.name, s.schema)

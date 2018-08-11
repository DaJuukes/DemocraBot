const mongoose = require('mongoose')

module.exports = async (options = {}) => {
  let dbName = 'data_hempcoin_' + process.env.ENV

  if (global.env === 'development' && !options.silent) {
    mongoose.set('debug', true)
  }

  let mongoConnectionString = `mongodb://${process.env.DB_HOST}:27017/${dbName}`
  let db = await mongoose.connect(mongoConnectionString, { useNewUrlParser: true })

  return {
    db: db
  }
}

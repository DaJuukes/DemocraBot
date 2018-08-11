const mongoose = require('mongoose')

let s = {
  name: 'User',
  schema: new mongoose.Schema({
    id: {
      type: String,
      unique: true
    },
    balance: {
      type: Number,
      default: '0'
    },
    addr: {
      type: String
    }
  }, {
    timestamps: true
  })
}

s.schema.statics.tip = async function (tipper, receiver, amount) {
  return this.validateTipAmount(tipper, amount).then(() => {
    return this.findOneAndUpdate({ id: tipper.id }, { $inc: { 'balance': -amount } }).then(() => {
      return this.findOneAndUpdate({ id: receiver.id }, { $inc: { 'balance': amount } })
    })
  })
}

s.schema.statics.deposit = async function (user, amount) {
  return new Promise((resolve, reject) => {
    this.validateDepositAmount(user, amount).then(() => {
      this.findOneAndUpdate({ _id: user._id }, { $inc: { 'balance': amount } }).then((r) => resolve(r))
    }).catch((err) => reject(err))
  })
}

s.schema.statics.withdraw = async function (user, amount) {
  return new Promise((resolve, reject) => {
    this.validateWithdrawAmount(user, amount).then(() => {
      this.findOneAndUpdate({ _id: user._id }, { $inc: { 'balance': amount } }).then((r) => resolve(r))
    }).catch((err) => reject(err))
  })
}

s.schema.statics.validateDepositAmount = function (user, amount) {
  if (amount <= 0) return Promise.reject(new Error('Zero or negative amount not allowed'))

  return Promise.resolve({})
}

s.schema.statics.validateWithdrawAmount = async function (user, amount) {
  if (isNaN(amount)) return Promise.reject(new Error('That amount is not a number.'))
  else if (amount < 1) return Promise.reject(new Error('The minimum amount allowed to withdraw is 0.1 THC.'))
  else if (amount > user.balance) return Promise.reject(new Error('You do not have sufficient funds!'))

  return Promise.resolve({})
}

s.schema.statics.validateTipAmount = async function (user, amount) {
  if (isNaN(amount)) return Promise.reject(new Error('That amount is not a number.'))
  else if (amount < 1) return Promise.reject(new Error('The minimum amount allowed to tip is 1 THC.'))
  else if (amount > user.balance) return Promise.reject(new Error('You do not have sufficient funds!'))

  return Promise.resolve({})
}

module.exports = mongoose.model(s.name, s.schema)

const Processor = require('../../lib/payment_processor.js')
const processor = new Processor({ agenda: global.agenda })
const {User} = require('../../db')

module.exports = bot => {
  bot.getNewAddress = async function () {
    return processor.getAddress()
  }

  bot.updateUserAddress = async function (id, addr) {
    let user = await User.findOne({ id })
    if (!user) user = await bot.createUser({id}, false)
    return User.findOneAndUpdate({ id }, { addr })
  }
}

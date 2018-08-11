const handleMessage = require('../handlers/msgHandler.js')

exports.run = (bot, msg) => {
  handleMessage(msg, bot, null)
}

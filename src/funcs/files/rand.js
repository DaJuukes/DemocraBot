const chance = parseInt(process.env.MESSAGE_CHANCE)
const reward = parseInt(process.env.MESSAGE_REWARD)

const {User} = require('../../db')

module.exports = bot => {
  bot.runMessageCheck = async function (message) {
    return new Promise(async (resolve, reject) => {
      const percent = bot.random()
      if (percent) {
      // credit
        let user = await User.findOne({ id: message.author.id })

        if (!user) user = await bot.createUser(message.author, true)

        User.deposit(user, reward).then(() => {
          message.react('💰').then(() => {
            resolve(true)
          }).catch((err) => {
            reject(err)
          })
        }).catch(err => {
          reject(err)
        })
      } else {
        resolve(true)
      }
    })
  }

  bot.random = function () {
    return Math.random() < (chance / 100)
  }
}

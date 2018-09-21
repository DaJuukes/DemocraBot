const {User} = require('../db')
module.exports = {
  name: 'credit',
  type: 'core',
  usage: 'credit [tag] [amount]',
  example: 'deposit',
  permission: 6,
  help: 'Manually credit a user.',
  main: async function (bot, message) {
    const user = message.mentions.users.first()
    const amount = message.args[1]

    if (!user) return message.channel.send(':x: That is not a valid user.')
    else if (!amount || amount < 0) return message.channel.send(':x: That is not a valid amount.')

    let mongoUser = await bot.getMongoUser(user.id)

    if (!user) mongoUser = await bot.createUser(user, true)

    return User.deposit(mongoUser, amount).then(() => {
      return message.channel.send(':white_check_mark: Credit successful.')
    }).catch((err) => {
      return message.channel.send(':x: Credit unsuccessful. Error: \n `' + err + '`')
    })
  }
}

module.exports = {
  name: 'balance',
  type: 'core',
  usage: 'buy',
  example: 'buy',
  permission: 1,
  help: 'Buy stock.',
  main: async function (bot, message) {
    const user = await bot.validateUser(message.author.id)

    if (!user) return message.channel.send('You do not have any funds in your account!')
    else return message.channel.send('You have a total of **$' + bot.addCommas(user.balance) + '** in your account.')
  }
}

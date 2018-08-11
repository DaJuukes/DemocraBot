module.exports = {
  name: 'buy',
  type: 'core',
  usage: 'buy',
  example: 'buy',
  permission: 1,
  help: 'Buy stock.',
  main: function (bot, message) {
    const amount = parseInt(message.args[1])
    const receiver = message.mentions.users.first()

    if (!receiver) return message.channel.send('You must specify a user to tip!')
    else if (!amount || isNaN(amount)) return message.channel.send('That amount is not valid!')

    return bot.tip(message.author, receiver, amount).then(() => {
      return message.channel.send(`:white_check_mark: Successfully tipped ${receiver} ${amount} THC!`)
    }).catch(({message}) => {
      return message.channel.send(`:x: An error occured: ${message}`)
    })
  }
}

module.exports = {
  name: 'tip',
  type: 'core',
  usage: 'tip [user] [amount]',
  example: 'tip @user 2',
  permission: 1,
  help: 'Tip another user.',
  main: function (bot, message) {
    const amount = parseInt(message.args[1])
    let receiver = message.mentions.members.first()

    if (!receiver) return message.channel.send('You must specify a user to tip!')
    else if (!amount || isNaN(amount)) return message.channel.send('That amount is not valid!')

    return bot.tip(message.author, receiver, amount).then(() => {
      return message.channel.send(`:white_check_mark: Successfully tipped ${receiver} ${amount} THC!`)
    }).catch((err) => {
      return message.channel.send(`:x: An error occured: ${err.message}`)
    })
  }
}

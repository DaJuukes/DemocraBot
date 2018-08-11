module.exports = {
  name: 'rain',
  type: 'core',
  usage: 'rain [amount per user]',
  example: 'rain 50',
  permission: 1,
  help: 'Give everyone in the channel a little THC.',
  main: function (bot, message) {
    const amount = parseInt(message.args[0])

    if (!amount || isNaN(amount)) return message.channel.send('That amount is not valid!')

    const members = message.channel.members

    return bot.rain(message.author, members, amount).then(() => {
      return message.channel.send(`:white_check_mark: Successfully rained ${amount} to ${members.size} users in this channel!`)
    }).catch((err) => {
      return message.channel.send(`:x: An error occured: ${err.message}`)
    })
  }
}

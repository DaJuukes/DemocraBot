module.exports = {
  name: 'withdraw',
  type: 'core',
  usage: 'withdraw [amount] [address]',
  example: 'withdraw 5 Tvxxxxxxxxxxxxxxxxxxxxxxx',
  permission: 1,
  help: 'Withdraw .',
  main: async function (bot, message) {
    const amount = parseInt(message.args[0])
    const addr = message.args[1]

    if (!amount || isNaN(amount)) return message.channel.send(':x: That amount is not valid.')
    else if (!addr || addr.length !== '34') return message.channel.send(':x: That address is not valid.')

    return bot.withdraw(message.author.id, amount, addr).then(() => {
      return message.channel.send(':white_check_mark: Your withdraw is pending, and you will receive a transaction ID soon.')
    }).catch(err => {
      if (err) return message.channel.send(':x: An error occured with your withdraw. Try again later.')
    })
  }
}

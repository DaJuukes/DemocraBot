module.exports = {
  name: 'deposit',
  type: 'core',
  usage: 'deposit',
  example: 'deposit',
  permission: 1,
  help: 'Get a new address to deposit funds into.',
  main: async function (bot, message) {
    const addr = await bot.getNewAddress(message.author.id)

    if (!addr) return message.channel.send(':x: An error occured while making a new address!')
    else {
      if (!addr.old) {
        await bot.updateUserAddress(message.author.id, addr.addr)
        return message.channel.send(':white_check_mark: Your new deposit address is: ' + addr.addr)
      } else {
        return message.channel.send(':e_mail: Your deposit address is: ' + addr.addr)
      }
    }
  }
}

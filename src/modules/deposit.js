module.exports = {
  name: 'deposit',
  type: 'core',
  usage: 'deposit',
  example: 'deposit',
  permission: 1,
  help: 'Get a new address to deposit funds into.',
  main: async function (bot, message) {
    const addr = await bot.getNewAddress()

    if (!addr) return message.channel.send(':x: An error occured while making a new address!')
    else {
      await bot.updateUserAddress(addr)
      return message.channel.send(':white_check_mark: Your new address is: ' + addr)
    }
  }
}


module.exports = {
  name: 'deposit',
  type: 'core',
  usage: 'deposit',
  example: 'deposit',
  permission: 1,
  help: 'Get a new address to deposit funds into.',
  main: async function (bot, message) {
    bot.getNewAddress(message.author.id).then(async (addr) => {
      console.log(addr)
      if (!addr || addr === undefined || addr === 'undefined') return message.channel.send(':x: An error occured while making a new address!')
      else {
        if (!addr.old) {
          await bot.updateUserAddress(message.author.id, addr.addr)
          return message.channel.send(':white_check_mark: Your new deposit address is: ' + addr.addr)
        } else {
          return message.channel.send(':e_mail: Your deposit address is: ' + addr.addr)
        }
      }
    }).catch(() => {
      return message.channel.send(':x: An error occured while making a new address!')
    })
  }
}

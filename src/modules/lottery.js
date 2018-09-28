const Discord = require('discord.js')
module.exports = {
  name: 'lottery',
  type: 'core',
  usage: 'lottery [amount]',
  example: 'lottery 500',
  permission: 1,
  help: 'Start a lottery.',
  main: async function (bot, message) {
    const amount = parseInt(message.args[0])

    if (!amount || isNaN(amount)) return message.channel.send('That amount is not valid!')

    const valid = await bot.validateAmount(message.author, amount)
    console.log(valid)
    if (!(valid instanceof Error)) return message.channel.send('You do not have sufficient funds!')

    const _time = parseInt(message.args[1])

    if (!_time || isNaN(_time)) return message.channel.send('That time is not valid!')

    // Time is in minutes
    const time = (message.args[2] === 'minutes') ? _time * 60 * 1000 : _time * 1000

    const emb = new Discord.RichEmbed()
      .setTitle('THC Lottery')
      .setColor('GREEN')
      .setDescription(`${message.author} is raffling **${amount}** THC for **${(_time / 60).toFixed(2)} minutes**! React to enter.`)

    return new Promise((resolve, reject) => {
      message.channel.send(emb).then((msg) => {
        msg.react('✔').then(() => {
          const collector = msg.createReactionCollector((reaction, user) => user.id !== message.author.id, { time })
          collector.on('end', rxns => {
            const rxn = rxns.get('✔')
            const users = rxn.users
            users.delete(bot.user.id)
            if (users.get(message.author.id)) users.delete(message.author.id)
            if (users.size === 0) return msg.delete().then(() => msg.channel.send('No users reacted to the message. Lottery cancelled.'))
            else {
              const arr = users.array()
              const winner = arr[Math.floor(Math.random() * arr.length)]
              return msg.edit(':confetti_ball: **The winner is:** ' + winner).then(() => {
                return bot.tip(message.author, winner, amount)
              })
            }
          })
        })
      })
    })
  }
}

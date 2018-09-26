const Discord = require('discord.js')
module.exports = {
  name: 'lottery',
  type: 'core',
  usage: 'lottery [amount]',
  example: 'lottery 500',
  permission: 1,
  help: 'Start a lottery.',
  main: function (bot, message) {
    const amount = parseInt(message.args[0])

    if (!amount || isNaN(amount)) return message.channel.send('That amount is not valid!')

    const _time = parseInt(message.args[1])

    if (!_time || isNaN(_time)) return message.channel.send('That time is not valid!')

    // Time is in minutes
    const time = _time * 60 * 1000

    const emb = new Discord.RichEmbed()
      .setTitle('THC Lottery')
      .setColor('GREEN')
      .setDescription(`${message.author} is raffling **${amount}** THC for **${_time}** minutes! React to enter.`)

    return new Promise((resolve, reject) => {
      message.channel.send(emb).then((msg) => {
        msg.react('✔').then(() => {
          const collector = msg.createReactionCollector((reaction, user) => user.id !== message.author.id, { time })
          collector.on('end', rxns => {
            let reactions = rxns.toArray()
          })
        })
      })
    })
  }
}

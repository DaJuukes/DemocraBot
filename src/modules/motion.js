const Discord = require('discord.js')

module.exports = {
  name: 'motion',
  type: 'core',
  usage: 'motion @role [majority] [text]',
  example: 'motion',
  permission: 6,
  help: 'Motion.',
  main: async function (bot, message) {
    const role = message.mentions.roles.first()
    if (!role) return message.channel.send('That is not a valid role. Format: d.motion @role [majority] [text]')

    const roleCount = role.members.size

    const majorityText = message.args[1].toLowerCase()
    let majority

    if (majorityText === 'simple') {
      majority = Math.floor(roleCount / 2) + 1
    } else if (majorityText === 'super') {
      majority = Math.ceil(roleCount * 0.67)
    } else {
      let int = parseInt(majorityText)
      if (isNaN(int) || int < 0) return message.channel.send('That custom majority number is not valid.')
      else if (int > roleCount) return message.channel.send('That custom majority number is more than the voting body.')
      else majority = int
    }

    const desc = 'This motion requires a majority of **' + majority + '** to pass/fail.\n\nVote description:\n**' + (message.args[2] || 'No description provided.') + '**'

    const baseEmb = new Discord.RichEmbed({
      title: 'Motion by ' + message.author.username,
      description: desc,
      color: 0x0000ff,
      fields: [
        {
          name: 'Yea',
          value: '----',
          'inline': true
        },
        {
          name: 'Nay',
          value: '----',
          'inline': true
        },
        {
          name: 'Abstain',
          value: '----',
          'inline': true
        }
      ]
    })

    message.channel.send(baseEmb).then(async (msg) => {
      await new Promise(async (resolve) => {
        await msg.react('✔')
        await msg.react('❌')
        await msg.react('🇦')
        resolve()
      })

      let yea = new Map()
      let nay = new Map()
      let abs = new Map()

      const updateEmb = async function (rxn, user) {
        if (user.bot) return
        else if (!role.members.get(user.id)) return rxn.remove(user.id)

        let tempY = yea.get(user.id)
        let tempN = nay.get(user.id)
        let tempA = abs.get(user.id)

        switch (rxn._emoji.name) {
          case '✔':
            if (tempN) { tempN.remove(user.id); nay.delete(user.id) } else if (tempA) { tempA.remove(user.id); abs.delete(user.id) }

            if (!tempY) yea.set(user.id, rxn)
            break
          case '❌':
            if (tempY) { tempY.remove(user.id); yea.delete(user.id) } else if (tempA) { tempA.remove(user.id); abs.delete(user.id) }

            if (!tempN) nay.set(user.id, rxn)
            break
          case '🇦':
            if (tempY) { tempY.remove(user.id); yea.delete(user.id) } else if (tempN) { tempN.remove(user.id); nay.delete(user.id) }

            if (!tempA) abs.set(user.id, rxn)
            break
          default:
            rxn.remove(user.id)
        }
        rxn.remove(user.id)

        let color

        if (yea.size >= majority) {
          color = 0x00ff00
        } else if (nay.size >= majority) {
          color = 0xff0000
        } else {
          color = 0x0000ff
        }

        let yStr = '----'
        let nStr = '----'
        let aStr = '----'

        for (let voter of yea) {
          yStr += `\n${bot.users.get(voter[0]).username}`
        }
        for (let voter of nay) {
          nStr += `\n${bot.users.get(voter[0]).username}`
        }
        for (let voter of abs) {
          aStr += `\n${bot.users.get(voter[0]).username}`
        }

        let tempEmb = new Discord.RichEmbed({
          title: 'Motion by ' + message.author.username,
          description: desc,
          color,
          fields: [
            {
              name: 'Yea',
              value: yStr,
              'inline': true
            },
            {
              name: 'Nay',
              value: nStr,
              'inline': true
            },
            {
              name: 'Abstain',
              value: aStr,
              'inline': true
            }
          ]
        })

        return msg.edit(tempEmb)
      }

      const collector = msg.createReactionCollector(() => true)
      collector.on('collect', (rxn) => {
        updateEmb(rxn, rxn.users.last())
      })
    })
  }
}

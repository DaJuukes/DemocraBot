module.exports = bot => {
  bot.enabled = function (command, guild) {
    if (command || guild) {
      return true
    } else {
      return false
    }
  }

  bot.permLevel = function (msg) {
    const {author, guild, member} = msg

    if (msg.channel.type === 'dm') return 5

    if (process.env.OWNER === msg.author.id) {
      return 6
    } else if (author && guild && guild.owner && author.id === guild.owner.id) {
      return 5
    } else if (member.hasPermission('MANAGE_GUILD')) {
      return 4
    } else if (member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) {
      return 3
    } else if (member.hasPermission('MANAGE_MESSAGES')) {
      return 2
    } else {
      return 1
    }
  }

  bot.addCommas = function (x) {
    if (!x) {
      return 'N/A'
    } else {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}

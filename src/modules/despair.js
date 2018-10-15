module.exports = {
  name: 'despair',
  type: 'core',
  usage: 'despair',
  example: 'despair',
  permission: 1,
  help: 'Despair.',
  main: async function (bot, message) {
    const messages = await message.channel.fetchMessages({ limit: 2 })
    const msg = messages.last()
    if (!msg) return message.channel.send('No message to despair :/')
    await msg.react('🇩')
    await msg.react('🇪')
    await msg.react('🇸')
    await msg.react('🇵')
    await msg.react('🇦')
    await msg.react('🇮')
    await msg.react('🇷')
    await msg.react('😭')
    return Promise.resolve()
  }
}

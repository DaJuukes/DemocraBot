const Discord = require('discord.js')
let bot = new Discord.Client()

bot = require('./funcs')(bot)
const readdir = require('fs').readdir

const setupDatabase = require('./db/setup')

bot.commands = new Discord.Collection()
bot.aliases = new Discord.Collection()
bot.events = new Discord.Collection()

readdir('./modules/', (err, files) => {
  if (err) throw err
  bot.handleMessage = require('./handlers/msgHandler.js')
  bot.log(`Loading ${files.length} commands!`)
  files.forEach(f => {
    try {
      var name = require(`./modules/${f}`).name
      bot.commands.set(name, require(`./modules/${f}`))
    } catch (e) {
      bot.log(`Unable to load command ${f}: ${e}`)
    }
  })
  bot.log(`Commands loaded!`)
})

readdir('./events/', (err, files) => {
  if (err) throw err
  bot.log(`Loading ${files.length} events!`)
  files.forEach(file => {
    bot.events.set(file.substring(0, file.length - 3), require(`./events/${file}`))
    bot.on(file.split('.')[0], (...args) => {
      require(`./events/${file}`).run(bot, ...args)
    })
  })
  bot.log(`Events loaded!`)
})

setupDatabase().then(result => {
  global.agenda = result.agenda
})

if (process.env.TOKEN) bot.login(process.env.TOKEN)

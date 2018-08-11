module.exports = bot => {
  const {readdirSync} = require('fs')
  const path = require('path')

  let names = readdirSync(path.join(__dirname, './files'))

  for (let name of names) {
    require('./files/' + name)(bot)
  }

  return bot
}

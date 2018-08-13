const {User, Tip} = require('../../db')

module.exports = bot => {
  bot.createUser = async function (user, welcome) {
    if (welcome) await bot.welcomeMessage(user).catch(console.log)
    const newUser = await User.create({ id: user.id })
    return newUser
  }

  bot.welcomeMessage = async function (user) {
    if (!user || user.bot) return
    return user.send('Welcome!') // TODO add embed
  }

  bot.tip = async function (_sender, _receiver, amount) {
    return new Promise(async (resolve, reject) => {
      const sender = await User.findOne({ id: _sender.id })
      let receiver = await User.findOne({ id: _receiver.id })

      if (!sender) {
        await bot.createUser(_sender)
        reject(new Error('You did not have a tipbot account, so I created one for you!'))
      }

      if (!receiver) {
        receiver = await bot.createUser(_receiver)
      }

      if (_receiver.id === _sender.id) {
        reject(new Error('You may not tip yourself!'))
      }

      await User.tip(sender, receiver, amount).then(() => {
        const tip = new Tip({tipper: sender._id, tipped: receiver._id, amount})
        tip.save((err) => {
          if (err) reject(err)
          resolve(true)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  bot.rain = async function (_sender, members, amount) {
    return new Promise(async (resolve, reject) => {
      const sender = await User.findOne({ id: _sender.id })

      if (!sender) {
        await bot.createUser(_sender)
        reject(new Error('You did not have a tipbot account, so I created one for you!'))
      }

      const size = members.size - 1 // account for sender

      const amountRequired = amount * size

      if (sender.balance < amountRequired) reject(new Error(`You do not have enough funds to rain ${amount} THC each to ${size} users. You have ${sender.balance} THC, and need ${amountRequired} THC!`))
      else {
        for (let receiverID of members.keys()) {
          let receiver = await User.findOne({ id: receiverID })
          if (!receiver) {
            receiver = await bot.createUser({ id: receiverID })
          }
          if (receiver.id !== _sender.id) {
            await User.tip(sender, receiver, amount).then(() => {
              const tip = new Tip({tipper: sender._id, tipped: receiver._id, amount})
              tip.save((err) => {
                if (err) reject(err)
              })
            }).catch((err) => {
              reject(err)
            })
          }
        }
        resolve(true)
      }
    })
  }

  bot.validateUser = function (id) {
    return User.findOne({id})
  }

  bot.toFixed = function (num, fixed) {
    var re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?')
    return num.toString().match(re)[0]
  }
}

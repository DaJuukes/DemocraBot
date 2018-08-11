const {User, Tip} = require('../../db')

async function welcomeMessage (user) {
  return user.send('Welcome!') // TODO add embed
}

async function createUser (user) {
  return welcomeMessage(user).then(() => {
    return User.create({ username: user.username })
  })
}

module.exports = bot => {
  bot.tip = async function (_sender, _receiver, amount) {
    return new Promise(async (resolve, reject) => {
      const sender = await User.findOne({ id: _sender.id })
      let receiver = await User.findOne({ id: _receiver.id })

      if (!sender) {
        await createUser(_sender.username)
        reject(new Error('You did not have a tipbot account, so I created one for you!'))
      } else if (!receiver) {
        receiver = await createUser(_receiver.name)
      } else if (receiver.id === sender.id) {
        reject(new Error('You may not tip yourself!'))
      } else {
        await User.tip(sender, receiver, amount).then(() => {
          const tip = new Tip({tipper: sender._id, tipped: receiver._id, amount})
          tip.save((err) => {
            if (err) reject(err)
            resolve(true)
          })
        }).catch((err) => {
          reject(err)
        })
      }
    })
  }

  bot.validateUser = function (id) {
    return User.findOne({id})
  }
}

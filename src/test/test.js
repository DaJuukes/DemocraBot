const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const assert = chai.assert

const dotenv = require('dotenv')

dotenv.config({ path: './env/vars.env' })

process.env.ENV = 'test'

const models = require('../db')
const setupDatabase = require('../db/setup')
const mongoose = require('mongoose')

chai.use(chaiAsPromised)

const createUser = async () => {
  const random = Math.random().toString()

  const attributes = {
    id: random,
    addr: random,
    balance: '100'
  }

  const r = await models.User.create(attributes)
  return r
}

const processParallelTransactions = (user, transactions) => {
  const promises = transactions.map((amount) => {
    if (amount < 0) {
      return models.User.withdraw(user, Math.abs(amount))
    } else {
      return models.User.deposit(user, Math.abs(amount))
    }
  })

  return Promise.all(promises)
}

before(function () {
  return setupDatabase().then((result) => {
    global.agenda = result.agenda
    return mongoose.connection.db.dropDatabase()
  }).then(() => {
    return models.User.findOne({}) // initializes model (temp hack)
  })
})

describe('Withdraw', function () {
  let user

  beforeEach(async function () {
    user = await createUser()
    await models.Job.remove() // clear jobs
  })

  it('should not allow withdraw more than user balance', async function () {
    let amount = user.balance + 1

    return assert.isRejected(models.User.withdraw(user, amount), 'You do not have sufficient funds!')
  })

  it('should not allow withdraw more than user balance - string input', async function () {
    let amount = '300'

    return assert.isRejected(models.User.withdraw(user, amount), 'You do not have sufficient funds!')
  })

  it('should not allow withdraw negative amount', async function () {
    let amount = -100

    return assert.isRejected(models.User.withdraw(user, amount), 'The minimum amount allowed to withdraw is 0.1 THC.')
  })

  it('should not allow withdraw zero amount', async function () {
    let amount = 0

    return assert.isRejected(models.User.withdraw(user, amount), 'The minimum amount allowed to withdraw is 0.1 THC.')
  })
})

describe('Deposit', function () {
  let user

  beforeEach(async function () {
    user = await createUser()
  })

  it('should not allow deposit negative amount', async function () {
    let amount = -100

    return assert.isRejected(models.User.deposit(user, amount), 'Zero or negative amount not allowed')
  })

  it('should update balance w/ deposit', async function () {
    const amount = 15
    const newBalance = user.balance + amount

    await models.User.deposit(user, amount).catch(console.log)

    user = await models.User.findOne({ id: user.id })
    assert.equal(user.balance, newBalance)
  })
})

describe('Deposit/Withdraw Race Conditions', function () {
  let user

  beforeEach(async function () {
    user = await createUser()
  })

  it('immediate withdraw and deposit should result in proper balance', async function () {
    const transactions = [-3, 2]
    const amount = transactions.reduce((a, b) => a + b, 0)
    const newBalance = user.balance + amount

    return processParallelTransactions(user, transactions).then(async () => {
      user = await models.User.findOne({ id: user.id })
      assert.equal(user.balance, newBalance)
    })
  })
})

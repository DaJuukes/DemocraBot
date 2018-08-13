const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const assert = chai.assert
const sinon = require('sinon')

const dotenv = require('dotenv')

dotenv.config({ path: './env/vars.env' })
process.env.RPC_ACC = 'test'

process.env.ENV = 'test'

const models = require('../db')
const setupDatabase = require('../db/setup')
const mongoose = require('mongoose')

const PaymentProcessor = require('../lib/payment_processor.js')

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

const createDepositTX = async (addr) => {
  const random = Math.random().toString()

  return {
    attrs: {
      data: {
        txid: random,
        recipientAddress: addr,
        amount: '100'
      }
    }
  }
}

const createWithdrawTX = async (user) => {
  return {
    attrs: {
      data: {
        userId: user._id,
        recipientAddress: user.addr,
        amount: '100'
      }
    }
  }
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

before(async function () {
  return setupDatabase().then(async (result) => {
    global.agenda = result.agenda
    await mongoose.connection.db.dropDatabase()
    return true
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

describe('Job handling', function () {
  let txID = Math.random().toString()
  let fakeFuncOne = sinon.fake.returns(Math.random().toString())
  let fakeFuncTwo = sinon.fake.resolves([{ account: process.env.RPC_ACC, txid: txID, amount: 100, address: 'test' }])
  let processor = new PaymentProcessor({ agenda: global.agenda, pivxClient: { send: fakeFuncOne, listTransactions: fakeFuncTwo } })
  let user

  beforeEach(async function () {
    user = await createUser()
  })

  it('should create and execute a deposit order', async function () {
    const opts = await createDepositTX(user.addr)
    return processor.performDeposit(opts).then((d) => {
      return models.User.findOne({ _id: user._id }).then((newUser) => {
        assert.equal(newUser.balance, 200)
      })
    })
  })

  it('should create and execute a withdraw order', async function () {
    const opts = await createWithdrawTX(user)
    return processor.performWithdraw(opts).then((d) => {
      return models.User.findOne({ _id: user._id }).then((newUser) => {
        assert.equal(newUser.balance, 0)
        assert.equal(fakeFuncOne.callCount, 1)
      })
    })
  })

  it('should check for and handle deposits', async function () {
    const mock = sinon.mock(processor)
    mock.expects('createDepositOrder').once().withArgs(txID, 'test', 100)

    await processor.checkDeposit()

    mock.verify()
  })
})

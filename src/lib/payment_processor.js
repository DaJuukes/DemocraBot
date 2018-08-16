global.srcRoot = require('path').resolve('./')
const {Transaction, User, Job} = require('../db')

const PIVXClient = require('./pivx_client.js')

class PaymentProcessor {
  constructor (options) {
    this.agenda = options.agenda
    this.pivxClient = options.pivxClient || new PIVXClient()
    this.parent = options.parent || null
  }

  reportException (e) {
    console.error(e)
  }

  async performWithdraw (options) {
    try {
      await this.withdraw(options)
      return { success: true }
    } catch (e) {
      this.reportException(e)
      return { error: e }
    }
  }

  async performDeposit (options) {
    try {
      await this.deposit(options)
      return { success: true }
    } catch (e) {
      console.error(e)
      return new Error(e)
    }
  }

  async getAddress (options) {
    try {
      return this.pivxClient.accountCreate()
    } catch (e) {
      this.reportException(e)
      return { error: e }
    }
  }

  async checkDeposit () {
    return this.pivxClient.listTransactions().then(txs => {
      const promises = txs.map(tx => {
        return new Promise((resolve, reject) => {
          if (tx.account === process.env.RPC_ACC) {
            Transaction.findOne({ txid: tx.txid }).then(async result => {
              if (!result) {
                await this.createDepositOrder(tx.txid, tx.address, tx.amount)
                resolve(true)
              }
            }).catch(reject)
          }
        })
      })
      return Promise.all(promises)
    }).catch((err) => {
      console.error('Daemon connection error: ' + err.stack)
      return err
    })
  }

  async createDepositOrder (txID, recipientAddress, amount) {
    let job = await Job.findOne({ 'data.txid': txID })

    if (!job) {
      console.log('New transaction! TXID: ' + txID)

      job = await this.agenda.create('deposit_order', { recipientAddress: recipientAddress, txid: txID, amount: amount })
      return new Promise((resolve, reject) => {
        job.save()
        resolve()
      })
    }

    return job
  }

  /*
        amount: {String}
    */
  async withdraw (job) {
    // parameters
    const userId = job.attrs.data.userId
    const recipientAddress = job.attrs.data.recipientAddress
    const amount = job.attrs.data.amount

    // Validate if user is present
    let user = await User.findById(userId)
    if (!user) throw new Error(`User ${userId} not found`)
    await User.validateWithdrawAmount(user, amount)

    // Step 1: Process transaction
    let sendID

    if (job.attrs.sendStepCompleted) {
      sendID = job.attrs.txid
    } else {
      const sent = await this.pivxClient.send(recipientAddress, amount)

      if (sent.error) throw new Error(sent.error)
      await Job.findOneAndUpdate({ _id: job.attrs._id }, { 'data.sendStepCompleted': true, 'data.txid': sent })
      sendID = sent
    }

    // Step 2: Update user balance
    if (!job.attrs.userStepCompleted) {
      await User.withdraw(user, amount)
      await Job.findByIdAndUpdate(job.attrs._id, { 'data.userStepCompleted': true })
    }

    // Step 3: Record Transaction
    if (!job.attrs.transactionStepCompleted) {
      // console.log(sendID);
      await Transaction.create({ userId: userId, withdraw: amount, txid: sendID })
      await Job.findByIdAndUpdate(job.attrs._id, { 'data.transactionStepCompleted': true })
    }

    if (process.send) process.send({ id: user.id, amount, address: recipientAddress, txid: sendID })

    return sendID
  }

  async deposit (job) {
    // parameters
    const txid = job.attrs.data.txid
    const recipientAddress = job.attrs.data.recipientAddress
    const amount = job.attrs.data.amount

    // Validate if user is present
    let user = await User.findOne({ addr: recipientAddress })

    if (!user) throw new Error(`User with address ${recipientAddress} not found`)

    if (!job.attrs.userStepCompleted) {
      await User.deposit(user, amount, txid)
      await Job.findByIdAndUpdate(job.attrs._id, { 'data.userStepCompleted': true })
    }

    if (!job.attrs.transactionStepCompleted) {
      await Transaction.create({ userId: user._id, deposit: parseInt(amount), txid: txid })
      await Job.findByIdAndUpdate(job.attrs._id, { 'data.transactionStepCompleted': true })
    }

    if (process.send) process.send({ id: user.id, amount, deposit: true })

    return txid
  }
}

module.exports = PaymentProcessor

import React from 'react'
import moment from 'moment'
import { groupBy, map, forEach, sumBy, toNumber, round, reduce } from 'lodash'
import transactions from '../../input/transactions.json'
import { getTransPerDay } from '../../helpers'

const Transactions = () => {
  let newTransactions = []

  // Update input data with load_amount as an number and formatted timeStamp.
  forEach(transactions, transaction => {
    const { id, customer_id, load_amount, time } = transaction
    const amount = toNumber(load_amount.replace(/[^a-z0-9.]/g, ''))
    const timeStamp = moment(time)
    newTransactions.push({
      id,
      customer_id,
      load_amount: amount,
      time: timeStamp
    })
  })

  const transactionsPerCustomer = groupBy(newTransactions, transaction => transaction['customer_id'] )

  return (
    // Mapping out transactions per customer
    map(transactionsPerCustomer, transactions => {
      // Group transactions of the week together
      const transPerWeek = groupBy(transactions, transaction => moment(transaction['time']).week())
      let verifiedTransactions = []

      // Check to see if user load amounts go over weekly allowance and place them into their own lists.
      const withinWeeklyLimit = []
      const overWeeklyLimit = []

      forEach(transPerWeek, week => {
        const weeklyLoad = round(sumBy(week, load => load.load_amount), 2)

        if (weeklyLoad <= 20000) {
          withinWeeklyLimit.push({ ...week })
        } else {
          overWeeklyLimit.push({ ...week })
        }
      })

      // Check if each daily loads go over daily allowance
      forEach(withinWeeklyLimit, weeklyTrans => {
        const daily = getTransPerDay(weeklyTrans)
        forEach(daily, day => {
          const validLoad = reduce(day, (load, nextLoad) => {
            return load.load_amount + nextLoad.load_amount > 5000 ? load.load_amount : load.load_amount + nextLoad.load_amount
          })
          map(day, (load, index) => {
            const loadAttempt = index + 1
            if (loadAttempt <= 3) {
              if (validLoad <= 5000 || validLoad.load_amount <= 5000) {
                verifiedTransactions.push({
                  ...load,
                  accepted: true
                })
              } else {
                verifiedTransactions.push({
                  ...load,
                  accepted: false
                })
              }
            } else {
              verifiedTransactions.push({
                ...load,
                accepted: false
              })
            }
          })
        })
      })

      //Map out the verified transactions to the browser.
      return (
        map(verifiedTransactions, transaction => {
          const { id, customer_id, accepted } = transaction
          return (
              <p key={id}>{`id: ${id}, customer_id: ${customer_id}, accepted: ${accepted}`}</p>
            )
        })
      )
    })
  )

}

export default Transactions

import moment from 'moment'
import { groupBy } from 'lodash'

export const getTransPerDay = transactions => groupBy(transactions, transaction => moment(transaction['time']).dayOfYear())

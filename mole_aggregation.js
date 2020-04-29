require('dotenv').config()

const { Client } = require('@elastic/elasticsearch')
const moment = require('moment')

const client = new Client({ node: process.env.ELASTICSEARCH_URL })

const indiceName = process.env.ELASTICSEARCH_INDEX_INPUT
const initialDate = moment().utc().startOf('day').add(-1, 'days').format()
const endDate = moment().utc().endOf('day').add(-1, 'days').format()
const meta = { index: { _index: process.env.ELASTICSEARCH_INDEX_OUTPUT } }

async function run() {

  let { body } = await client.sql.query({
    body: {
      query: `SELECT database, collection, operation, COUNT(operation) as count FROM "${indiceName}" WHERE timestamp BETWEEN '${initialDate}' AND '${endDate}' GROUP BY database,collection,operation`,
    },
  }).catch((err) => {
    console.log(err.body.error.reason)
  })

  executer(body.cursor, body.rows, body.columns)
}


async function executer(cursorID, rows, columns) {
  let payload = []

  rows.forEach((row) => {
    payload.push(meta)
    let data = {}
    for (var i = 0; i < row.length; i++) {
      data[columns[i].name] = row[i]
      data.timestamp = initialDate
    }
    payload.push(data)
  })

  await client.bulk({ body: payload }).catch((err) => {
    console.log(err.body.error.reason)
  })

  if (cursorID) {
    let { body } = await client.sql.query({
      body: { cursor: cursorID },
    }).catch((err) => {
      console.log(err.body.error.reason)
    })

    executer(body.cursor, body.rows, columns)
  }
}

run()
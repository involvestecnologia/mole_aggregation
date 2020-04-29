require('dotenv').config()

const { Client } = require('@elastic/elasticsearch')
const moment = require('moment')

const client = new Client({ node: process.env.ELASTICSEARCH_URL})

async function run () {
  let indiceName = process.env.ELASTICSEARCH_INDEX_INPUT
  let initialDate = moment().utc().startOf('day').add(-1, 'days').format()
  let endDate = moment().utc().endOf('day').add( -1, 'days').format()
  
  const { body } = await client.sql.query({
    body: {
      query: `SELECT database, collection, operation, COUNT(operation) as count FROM "${indiceName}" WHERE timestamp BETWEEN '${initialDate}' AND '${endDate}' GROUP BY database,collection,operation`
    }
  }).catch((err) => {
    console.log(err.body.error.reason)
  })

  let payload = []
  const meta = { index:{ _index: process.env.ELASTICSEARCH_INDEX_OUTPUT}}
    
  body.rows.forEach((row) => {
    payload.push(meta)
    let data = {}
    for (var i = 0; i < row.length; i++) {
      data[body.columns[i].name] = row[i]
      data.timestamp = initialDate
    }
    payload.push(data)
  })
  
  await client.bulk({ body: payload }).catch((err) => {
    console.log(err.body.error.reason)
  })
}

run()
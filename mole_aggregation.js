const { Client } = require('@elastic/elasticsearch')
const moment = require('moment')


const client = new Client({ node: 'http://localhost:9200'})

async function run () {
  let indiceName = "oplog-*"
  let initialDate = moment().utc().startOf('day').add(-1, 'days').format()
  let endDate = moment().utc().endOf('day').add( -1, 'days').format()
  
  const { body } = await client.sql.query({
    body: {
      query: `SELECT database, collection, operation, COUNT(operation) as count FROM "${indiceName}" WHERE timestamp BETWEEN '${initialDate}' AND '${endDate}' GROUP BY database,collection,operation`
    }
  })

  
  let payload = []
  const meta = { index:{ _index: 'monthly-analysis'}}
    
  body.rows.forEach((row) => {
    payload.push(meta)
    let data = {}
    for (var i = 0; i < row.length; i++) {
      data[body.columns[i].name] = row[i]
      data.timestap = initialDate
    }
    payload.push(data)
  })
  await client.bulk({ body: payload })
}

run().catch((err) => {
  console.log(err.body.error.reason)
})
const { Client } = require('@elastic/elasticsearch')
const moment = require('moment')

const client = new Client({ node: 'http://localhost:9200' })

async function run () {

  let indiceName = "oplog-*"
  let initialDate = moment().utc().startOf('day').add(-1, 'days').format()
  let endDate = moment().utc().endOf('day').add( -1, 'days').format()
  
  const { body } = await client.sql.query({
    body: {
      query: `SELECT database, collection, operation, COUNT(operation) as count FROM "${indiceName}" WHERE timestamp BETWEEN '${initialDate}' AND '${endDate}' GROUP BY database,collection,operation`
    }
  })

  const data = body.rows.map(row => {
    const content = {}
    content.index = { _index: 'monthly-analysis' }
    
    for (var i = 0; i < row.length; i++) {
      content[body.columns[i].name] = row[i]
    }
   
    content.timestap = initialDate
    return content
  })

  console.log(data)
  await client.bulk({ body: data })
}

run().catch((err) => {
  console.log(err.body.error.reason)
})
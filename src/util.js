import Promise from 'bluebird'

import pg from 'pg'
import querybox from 'querybox'

export default function(connStr, pathToSQLFiles) {
  const db = {
    pg: pg,

    getClient: () => {
      return new Promise((resolve, reject) => {
        pg.connect(connStr, (error, client, done) => {
          client.done = done

          if (error) return reject(error)
          return resolve(client)
        })
      })
    },

    query: async (client, text, vals) => {
      let callDone = false // if a client is passed in don't call done

      if (!client || typeof(client.query) !== 'function') {
        vals = text
        text = client

        client = await db.getClient()
        callDone = true
      }

      return new Promise((resolve, reject) => {
        client.query(text, vals, (error, result) => {
          if (callDone) client.done()
          if (error) return reject(error)
          return resolve(result.rows)
        })
      })
    },

    one: async (client, text, vals) => {
      const rows = await db.query(client, text, vals)
      return rows[0]
    }
  }

  if (!pathToSQLFiles) return db

  const sqlPath = pathToSQLFiles
  const box = querybox(sqlPath, async function(text, vals, callback) {
    try {
      rows = await db.query(text, vals)
      return callback(null, rows)
    } catch(error) {
      return callback(error)
    }
  })

  db.run = async (client, name, vals) => {
    let callDone = false // if a client is passed in don't call done

    if (!client || typeof(client.query) !== 'function') {
      vals = name
      name = client

      client = await db.getClient()
      callDone = true
    }

    const queryFn = client.query.bind(client)

    return new Promise((resolve, reject) => {
      box._run(queryFn, name, vals, (error, result) => {
        if (callDone) client.done()
        if (error) return reject(error)
        return resolve(result.rows)
      })
    })
  }

  db.first = async (client, name, vals) => {
    return (await db.run(client, name, vals))[0]
  }

  return db
}

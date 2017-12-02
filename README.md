# node-pg-util [![Build Status](https://travis-ci.org/lalitkapoor/node-pg-util.svg?branch=travis-ci)](https://travis-ci.org/lalitkapoor/node-pg-util)
Utility Belt for PostgreSQL

`npm install pg-util`

The goal of this library is to make writing commons database tasks more succinct:

- getting a client `#getClient()`
- query the database `#query(<client>, text, vals)`
- getting the first row only `#one(<client>, text, vals)`
- executing a sql file (by name) `#run(<client>, name, vals)`
- executing a sql file (by name) and return the first row `#first(<client>, name, vals)`

All the methods returns promises and if you use the new `async/await` features in ES7 you can write some nifty code. Check out some of the examples:

#### Transactions
```javascript
import pg from 'pg'
import pgUtil from 'pg-util'

(async function() {
  const createTableSQL = `CREATE TABLE boo (
    name TEXT NOT NULL,
    email TEXT NOT NULL PRIMARY KEY
  );`
  const insertSQL = `INSERT INTO boo(name, email) VALUES ('John Doe', 'test@test.com');`
  const selectSQL = 'SELECT * FROM boo;'

  await this.db.transaction(async (tx) => {
    const ct = await tx.query(createTableSQL)
    const i = await tx.query(insertSQL)

    let row = null

    // should return a row when using the client used in the transaction
    row = await tx.one(selectSQL)
    should.equal(row.name, 'John Doe')
    should.equal(row.email, 'test@test.com')

    // should error with a client not used for the transaction
    try {
      row = await this.db.one(selectSQL)
      should.not.exist(row)
    } catch (error) {
      should.exist(error)
      should.equal(error.code, '42P01')
    }

    await tx.query('ABORT')
  })
})()
```

#### Execute a paramterized query using a SQL file and get the first row

```sql
-- ./resources/tests/sql/select-param.sql file
SELECT $1::text AS "name";
```

```javascript
import path from 'path'
import pg from 'pg'
import pgUtil from 'pg-util'
import appRoot from 'app-root-path'

(async function() {
  const pathToSQLFiles = path.join(appRoot.path, '/resources/tests/sql')
  const db = pgUtil(null, pathToSQLFiles)

  const row = await db.first('select-param', ['John Doe'])
  should.equal(row.name, 'John Doe')
})()
```

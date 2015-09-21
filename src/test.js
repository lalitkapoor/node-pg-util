import path from 'path'
import should from 'should'
import appRoot from 'app-root-path'

import pgUtil from './util'

const q = "SELECT 'John Doe'::text AS name"
const qParam = "SELECT $1::text AS name"
const param = 'John Doe'

describe('pg-util', function() {
  before(function() {
    const pathToSQLFiles = path.join(appRoot.path, '/resources/tests/sql')
    const db = pgUtil(null, pathToSQLFiles)
    this.db = db
  })

  describe('#getClient', function() {
    it('should get a client', async function() {
      const client = await this.db.getClient()

      should.exist(client)
      should.exist(client.query)
      client.query.should.be.a.Function()
    })
  })

  describe('#query', function() {
    it('should perform a query', async function() {
      const rows = await this.db.query(q)
      should.equal(rows[0].name, param)
    })

    it('should perform a parameterized query', async function() {
      const rows = await this.db.query(qParam, [param])
      should.equal(rows[0].name, param)
    })

    it('should perform a query with a specified client', async function() {
      const client = await this.db.getClient()
      const rows = await this.db.query(client, q)
      should.equal(rows[0].name, param)
    })

    it('should perform a parameterized query with a specified client', async function() {
      const client = await this.db.getClient()
      const rows = await this.db.query(client, qParam, [param])
      should.equal(rows[0].name, param)
    })
  })

  describe('#one', function() {
    it('should run a query returning the first row', async function() {
      const row = await this.db.one(q)
      should.equal(row.name, param)
    })

    it('should run a query returning the first row (parameterized)', async function() {
      const row = await this.db.one(qParam, [param])
      should.equal(row.name, param)
    })

    it('should run a query returning the first row with a specified client', async function() {
      const client = await this.db.getClient()
      const row = await this.db.one(client, q)
      should.equal(row.name, param)
    })

    it('should run a query returning the first row with a specified client (parameterized)', async function() {
      const client = await this.db.getClient()
      const row = await this.db.one(client, qParam, [param])
      should.equal(row.name, param)
    })
  })

  describe('#run', function() {
    it('should run a query using a given sql file', async function() {
      const rows = await this.db.run('select')
      should.equal(rows[0].name, param)
    })

    it('should run a query using a given sql file (parameterized)', async function() {
      const rows = await this.db.run('select-param', [param])
      should.equal(rows[0].name, param)
    })

    it('should run a query using a given sql file and client', async function() {
      const client = await this.db.getClient()
      const rows = await this.db.run(client, 'select')
      should.equal(rows[0].name, param)
    })

    it('should run a query using a given sql file and client (parameterized)', async function() {
      const client = await this.db.getClient()
      const rows = await this.db.run(client, 'select-param', [param])
      should.equal(rows[0].name, param)
    })
  })

  describe('#first', function() {
    it('should run a query returning the first row using a given sql file', async function() {
      const row = await this.db.first('select')
      should.equal(row.name, param)
    })

    it('should run a query returning the first row using a given sql file (parameterized)', async function() {
      const row = await this.db.first('select-param', [param])
      should.equal(row.name, param)
    })

    it('should run a query returning the first row using a given sql file and client', async function() {
      const client = await this.db.getClient()
      const row = await this.db.first(client, 'select')
      should.equal(row.name, param)
    })

    it('should run a query returning the first row using a given sql file and client (parameterized)', async function() {
      const client = await this.db.getClient()
      const row = await this.db.first(client, 'select-param', [param])
      should.equal(row.name, param)
    })
  })
})

const bcrypt = require('bcryptjs')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
})

describe('GET /api/users', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, 1)
  })
})

describe('POST /api/users', () => {
  describe('succeeds with valid data', () => {
    test('a valid user can be created', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map((u) => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('password is not returned in response', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
      }

      const response = await api.post('/api/users').send(newUser).expect(201)

      assert.strictEqual(response.body.password, undefined)
      assert.strictEqual(response.body.passwordHash, undefined)
    })
  })

  describe('fails with proper status code and message', () => {
    test('if username is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        name: 'Test User',
        password: 'password123',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

      assert(result.body.error.includes('username') || result.body.error.includes('required'))
    })

    test('if username is too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ab',
        name: 'Test User',
        password: 'password123',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

      assert(result.body.error.includes('Username must be at least 3 characters long'))
    })

    test('if username is already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('if password is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'testuser',
        name: 'Test User',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

      assert(result.body.error.includes('Password'))
    })

    test('if password is too short', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'ab',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

      assert.strictEqual(result.body.error, 'Password must be at least 3 characters long')
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})

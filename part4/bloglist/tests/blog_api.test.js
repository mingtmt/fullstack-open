const bcrypt = require('bcryptjs')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create a user
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()

  // Create blogs for this user
  const blogObjects = helper.initialBlogs.map((blog) => new Blog({ ...blog, user: user._id }))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blog posts have id property instead of _id', async () => {
    const response = await api.get('/api/blogs')

    assert.ok(response.body[0].id)
    assert.strictEqual(response.body[0]._id, undefined)
  })

  test('returned blogs have user information', async () => {
    const response = await api.get('/api/blogs')

    assert.ok(response.body[0].user)
    assert.ok(response.body[0].user.username)
  })
})

describe('POST /api/blogs', () => {
  test('fails with status 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Test blog',
      author: 'Test author',
      url: 'http://test.com',
      likes: 5,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('a valid blog can be added with valid token', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    assert(titles.includes('Canonical string reduction'))
  })

  test('created blog has user information in response', async () => {
    const newBlog = {
      title: 'Test blog',
      author: 'Test author',
      url: 'http://test.com',
      likes: 5,
    }

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(201)

    assert.ok(response.body.user)
    assert.strictEqual(response.body.user.username, 'root')
  })

  test('a new blog without likes defaults to 0', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
    }

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })

  test('a new blog without title is not added', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
      likes: 4,
    }

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('a new blog without url is not added', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      likes: 4,
    }

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('PUT /api/blogs/:id', () => {
  test('fails with status 401 if token is not provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      likes: blogToUpdate.likes + 1,
    }

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedData).expect(401)
  })

  test('succeeds with status 200 if valid token and user owns the blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    const updatedData = {
      likes: blogToUpdate.likes + 1,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updatedData)
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })

  test('fails with status 403 if user does not own the blog', async () => {
    // Create another user
    const passwordHash = await bcrypt.hash('password', 10)
    const anotherUser = new User({ username: 'another', passwordHash })
    await anotherUser.save()

    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'another', password: 'password' })

    const updatedData = {
      likes: blogToUpdate.likes + 1,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updatedData)
      .expect(403)
  })

  test('fails with status 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    const updatedBlog = {
      likes: 10,
    }

    await api
      .put(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updatedBlog)
      .expect(404)
  })

  test('fails with status 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    const updatedBlog = {
      likes: 10,
    }

    await api
      .put(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(updatedBlog)
      .expect(400)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('fails with status 401 if token is not provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('succeeds with status 204 if valid token and user owns the blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map((b) => b.title)
    assert(!titles.includes(blogToDelete.title))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })

  test('fails with status 403 if user does not own the blog', async () => {
    // Create another user
    const passwordHash = await bcrypt.hash('password', 10)
    const anotherUser = new User({ username: 'another', passwordHash })
    await anotherUser.save()

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'another', password: 'password' })

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })

    await api
      .delete(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})

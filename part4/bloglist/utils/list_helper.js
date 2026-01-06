const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlogs = (blogs) => {
  return blogs.reduce((favorite, blog) => {
    if (favorite.likes < blog.likes) {
      return blog
    }

    return favorite
  })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const blogCounts = {}

  blogs.forEach((blog) => {
    blogCounts[blog.author] = (blogCounts[blog.author] || 0) + 1
  })

  let topAuthor = ''
  let maxBlogs = 0

  for (const [author, count] of Object.entries(blogCounts)) {
    if (count > maxBlogs) {
      maxBlogs = count
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    blogs: maxBlogs,
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likeCounts = {}

  blogs.forEach((blog) => {
    likeCounts[blog.author] = (likeCounts[blog.author] || 0) + blog.likes
  })

  let topAuthor = ''
  let maxLikes = 0

  for (const [author, count] of Object.entries(likeCounts)) {
    if (count > maxLikes) {
      maxLikes = count
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    likes: maxLikes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlogs,
  mostBlogs,
  mostLikes,
}

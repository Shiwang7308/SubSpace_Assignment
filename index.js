const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = 3000;

const cache = {};

app.get('/api/blog-stats', async (req, res) => {
  const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

  const cacheKey = 'blog-stats';

  if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - 300000) { // Cache for 5 minutes (300,000 milliseconds)
    res.json(cache[cacheKey].data);
    return;
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-hasura-admin-secret': adminSecret,
      },
    });

    const blogData = response.data.blogs;

    if (!blogData || blogData.length === 0) {
      res.status(404).json({ error: 'No blog data found.' });
      return;
    }

    const totalBlogs = blogData.length;
    const blogWithLongestTitle = _.maxBy(blogData, (blog) => blog.title.length);
    const blogsWithPrivacyInTitle = _.filter(blogData, (blog) =>
      _.includes(blog.title.toLowerCase(), 'privacy')
    );
    const uniqueBlogTitles = _.uniqBy(blogData, 'title');

    const responseJson = {
      totalBlogs,
      longestBlogTitle: blogWithLongestTitle.title,
      blogsWithPrivacyInTitle: blogsWithPrivacyInTitle.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

    // Cache the data
    cache[cacheKey] = {
      data: responseJson,
      timestamp: Date.now(),
    };
    res.json(responseJson);
  } catch (error) {
    console.error(`Error: ${error.message}`);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data.message || 'An error occurred while fetching data.';
      res.status(statusCode).json({ error: errorMessage });
    } else if (error.request) {
      res.status(500).json({ error: 'An error occurred while making the API request.' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
});

app.get('/api/blog-search', async (req, res) => {
  const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';
  const query = req.query.query.toLowerCase();
  const cacheKey = `blog-search:${query}`; // Unique cache key based on query

  // Check if cached data exists and is not expired
  if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - 300000) { // Cache for 5 minutes (300,000 milliseconds)
    res.json(cache[cacheKey].data);
    return;
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-hasura-admin-secret': adminSecret,
      },
    });

    const blogData = response.data.blogs;

    if (!blogData || blogData.length === 0) {
      res.status(404).json({ error: 'No blog data found.' });
      return;
    }

    const blogsWithQueryStringInTitle = _.filter(blogData, (blog) =>
      _.includes(blog.title.toLowerCase(), query)
    );

    // Cache the data
    cache[cacheKey] = {
      data: { blogs: blogsWithQueryStringInTitle },
      timestamp: Date.now(),
    };

    res.json({ blogs: blogsWithQueryStringInTitle });
  } catch (error) {
    console.error(`Error: ${error.message}`);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data.message || 'An error occurred while fetching data.';
      res.status(statusCode).json({ error: errorMessage });
    } else if (error.request) {
      res.status(500).json({ error: 'An error occurred while making the API request.' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

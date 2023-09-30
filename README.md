# Developing a blog analytics and search tool using Express.js and Lodash with memoize functionality.
## Project Setup 
- clone the project on your local
- Execute `npm install` on the same path as of your root directory 
- Make sure you setup your "scripts" in package.json as "start": "nodemon index.js" and then run command npm start.

### 1) BLOGS STATS
- for getting blogs Stats hit url `http://localhost:3000/api/blog-stats` on your browser

### 2) Implement a search functionality that filters the blogs based on the provided query string (case-insensitive).
- for searching blogs hit url `http://localhost:3000/api/blog-search?query=CSS`
- In place of `CSS` you can write your `query string`

### Key Insights
1) Implement a caching mechanism using Lodash to store the analytics results and search results for a certain period. If the same requests are made within the caching period, return the cached results instead of re-fetching and re-analyzing the data

2) Handle errors that may occur during the data retrieval, analysis, or search process. If the third-party API is unavailable or returns an error, respond with an appropriate error message.

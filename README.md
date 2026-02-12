# DB Intro Architecture Demo

A simple demonstration of using various methods of data storage using Node.js and Express.

## Setup

```bash
npm install
npm start
```

Run to get all remote branches
```bash
git fetch -all
```

Then open `http://localhost:3000` in your browser.

## Project Structure

- `server.js` - Express server with REST API endpoints (`GET /api/users`, `POST /api/users`)
- `public/index.html` - HTML page with buttons
- `public/style.css` - CSS styles for the HTML page
- `public/script.js` - Client-side JavaScript using `fetch()` API to make HTTP requests

## How It Works

**Server**: Express serves static files and handles REST API requests. Uses in-memory array for data storage.

**Client**: HTML page with buttons that trigger JavaScript functions in `script.js`. The `fetch()` API sends HTTP requests to the server and updates the DOM with responses.

## Key Concepts

- Request-response cycle
- HTTP methods (GET, POST)
- JSON communication
- REST API endpoints
- Client-side JavaScript with `fetch()`

// Import Express framework - a popular Node.js web framework
const express = require('express');

// Create an Express application instance
// This is the main object we'll use to define routes and middleware
const app = express();

// Middleware: Parse JSON request bodies
// When a client sends JSON data (like in POST requests), this middleware
// automatically parses it and makes it available in req.body
app.use(express.json());

// Middleware: Serve static files from the 'public' directory
// This allows the server to serve HTML, CSS, and JavaScript files
// When someone visits '/', Express will look for 'public/index.html'
app.use(express.static('public'));

// In-memory data store for AlgoGroup attendance
// Dictionary mapping names to attendance counts
let attendees = {
  'Akash': 1
};

// REST API Endpoint: GET /api/attendees
// Returns the current state of attendance
app.get('/api/attendees', (req, res) => {
  res.json(attendees);
});

// REST API Endpoint: POST /api/checkin
// Increments attendance count for a given name
app.post('/api/checkin', (req, res) => {
  const { name } = req.body;

  // Validation: Name cannot be empty
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const cleanName = name.trim();

  // Check if the user has already checked in
  if (attendees[cleanName]) {
    attendees[cleanName] += 1;
  } else {
    attendees[cleanName] = 1;
  }

  // Return updated count
  res.json({ name: cleanName, count: attendees[cleanName] });
});

// Start the server and listen on port 3000
// The callback function runs when the server successfully starts
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Open your browser and visit http://localhost:3000');
});

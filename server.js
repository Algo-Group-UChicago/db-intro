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

const fs = require('fs').promises;
const path = require('path');
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read data from the file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default
    if (error.code === 'ENOENT') {
      return { 'Akash': 1 };
    }
    throw error;
  }
}

// Helper function to write data to the file
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// REST API Endpoint: GET /api/attendees
// Returns the current state of attendance
app.get('/api/attendees', async (req, res) => {
  try {
    const attendees = await readData();
    res.json(attendees);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// REST API Endpoint: POST /api/checkin
// Increments attendance count for a given name
app.post('/api/checkin', async (req, res) => {
  const { name } = req.body;

  // Validation: Name cannot be empty
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const cleanName = name.trim();

  try {
    // 1. Read existing data
    const attendees = await readData();

    // 2. Check if the user has already checked in
    if (attendees[cleanName]) {
      attendees[cleanName] += 1;
    } else {
      attendees[cleanName] = 1;
    }

    // 3. Write updated data back to file
    await writeData(attendees);

    // Return updated count
    res.json({ name: cleanName, count: attendees[cleanName] });
  } catch (error) {
    console.error('Error processing checkin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the server and listen on port 3000
// The callback function runs when the server successfully starts
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Open your browser and visit http://localhost:3000');
});

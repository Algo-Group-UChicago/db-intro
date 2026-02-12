// Import Express framework
const express = require('express');
const fs = require('fs');
const path = require('path');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Read DynamoDB ARN from file
const API_KEY_FILE = path.join(__dirname, 'dynamoarn');
let TABLE_NAME = '';
let REGION = 'us-east-1'; // Default region, can be parsed from ARN

try {
  const arn = fs.readFileSync(API_KEY_FILE, 'utf8').trim();
  // ARN format: arn:aws:dynamodb:region:account-id:table/table-name
  // We can try to split by ':' and '/' to get the table name
  if (arn.includes(':table/')) {
    const parts = arn.split(':');
    if (parts.length > 3) {
      REGION = parts[3]; // 4th element is region
    }
    const resourcePart = arn.split(':table/')[1];
    if (resourcePart) {
      TABLE_NAME = resourcePart;
      console.log(`Configured for DynamoDB Table: ${TABLE_NAME} in ${REGION}`);
    } else {
      console.error('Could not parse Table Name from ARN.');
    }
  } else {
    // Assume might be just the table name if not an ARN
    TABLE_NAME = arn;
    console.log(`Using provided string as Table Name: ${TABLE_NAME}`);
  }
} catch (err) {
  console.error('Error reading dynamoApiKey file:', err);
}

// Initialize DynamoDB Client
// Note: This requires AWS Credentials to be set in environment variables
// (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
// or in ~/.aws/credentials
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Helper: Fetch all attendees
async function getAttendees() {
  if (!TABLE_NAME) throw new Error('DynamoDB Table not configured');

  const command = new ScanCommand({
    TableName: TABLE_NAME
  });

  const response = await docClient.send(command);

  // Transform items to { Name: Count } map
  const attendees = {};
  if (response.Items) {
    response.Items.forEach(item => {
      // Assuming schema: { "name": "Akash", "count": 1 }
      // Partition Key: "name"
      if (item.name) {
        attendees[item.name] = item.count !== undefined ? item.count : 0;
      }
    });
  }
  return attendees;
}

// Helper: Atomic Increment
async function incrementAttendee(name) {
  if (!TABLE_NAME) throw new Error('DynamoDB Table not configured');

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { name: name },
    UpdateExpression: 'ADD #c :inc',
    ExpressionAttributeNames: { '#c': 'count' }, // 'count' is a reserved word safely mapped
    ExpressionAttributeValues: { ':inc': 1 },
    ReturnValues: 'UPDATED_NEW'
  });

  const response = await docClient.send(command);
  return response.Attributes.count;
}

// GET /api/attendees
app.get('/api/attendees', async (req, res) => {
  try {
    const attendees = await getAttendees();
    res.json(attendees);
  } catch (error) {
    console.error('DynamoDB Error:', error);
    // Return empty object on error to keep UI working
    res.json({});
  }
});

// POST /api/checkin
app.post('/api/checkin', async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const cleanName = name.trim();

  try {
    const newCount = await incrementAttendee(cleanName);
    res.json({ name: cleanName, count: newCount });
  } catch (error) {
    console.error('DynamoDB Update Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

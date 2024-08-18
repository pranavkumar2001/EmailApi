const express = require('express');
const fs = require('fs');
const serverless = require('serverless-http');

const app = express();
const port = process.env.PORT || 3000;
const filePath = './emails.json';

// Middleware to parse JSON bodies
app.use(express.json());

// Helper function to read data from the file
function readData() {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return [];
    }
}

// Helper function to write data to the file
function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API routes
app.post('/api/emails/add', (req, res) => {
    const emails = readData();
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (emails.includes(email)) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    emails.push(email);
    writeData(emails);
    res.status(201).json({ message: 'Email added successfully', email });
});

app.put('/api/emails/edit', (req, res) => {
    const emails = readData();
    const { oldEmail, newEmail } = req.body;

    const index = emails.indexOf(oldEmail);
    if (index === -1) {
        return res.status(404).json({ message: 'Email not found' });
    }

    emails[index] = newEmail;
    writeData(emails);
    res.json({ message: 'Email updated successfully', oldEmail, newEmail });
});

app.get('/api/emails/get', (req, res) => {
    try {
        const emails = readData();
        res.json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Error reading email data' });
    }
});

app.delete('/api/emails/remove', (req, res) => {
    const emails = readData();
    const { email } = req.body;

    const index = emails.indexOf(email);
    if (index === -1) {
        return res.status(404).json({ message: 'Email not found' });
    }

    emails.splice(index, 1);
    writeData(emails);
    res.json({ message: 'Email removed successfully', email });
});

// Export the app as a serverless function
module.exports = app;
module.exports.handler = serverless(app);

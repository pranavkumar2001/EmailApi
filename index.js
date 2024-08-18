require('dotenv').config();
const express = require('express');
const fs = require('fs');

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

// 1. Add a new email ID
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

// 2. Edit an existing email ID
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

// 3. Get all email IDs
app.get('/api/emails/get', (req, res) => {
    try {
        const emails = readData();
        res.json(emails);
    } catch (error) {
        res.status(500).json({ message: 'Error reading email data' });
    }
});

// 4. Remove an email ID
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

// Start the server
app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});

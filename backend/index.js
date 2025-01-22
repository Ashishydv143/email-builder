const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const env = require('dotenv').config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());

// Database Connection
mongoose.connect(process.env.MONGO_URI)

// Email Configuration Schema
const emailConfigSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    styles: Object,
    createdAt: { type: Date, default: Date.now },
});

const EmailConfig = mongoose.model('EmailConfig', emailConfigSchema);

// API to get the HTML layout
app.get('/api/getEmailLayout', async (req, res) => {
    try {
        const layoutPath = path.join(__dirname, 'layout.html');
        const data = await fs.promises.readFile(layoutPath, 'utf8');
        res.send(data);
    } catch (err) {
        console.error('Error reading layout.html:', err.message);
        res.status(500).json({ error: 'Failed to load the email layout file.' });
    }
});

// API to upload an image
app.post('/api/uploadImage', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let imageFile = req.files.image;
    const uploadDir = path.join(__dirname, 'public', 'uploads');

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, imageFile.name);

    imageFile.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error uploading image:', err);
            return res.status(500).send('Error uploading image.');
        }

        res.send({ message: 'File uploaded!', path: `/uploads/${imageFile.name}` });
    });
});


// API to save email configuration to the database
app.post('/api/uploadEmailConfig', async (req, res) => {
    const emailConfig = new EmailConfig(req.body);

    try {
        await emailConfig.save();
        res.status(200).send({ message: 'Configuration saved successfully!' });
    } catch (err) {
        console.error('Error saving email configuration:', err);
        res.status(500).send({ message: 'Failed to save configuration.' });
    }
});

// API to render and download the template
app.post('/api/renderAndDownloadTemplate', (req, res) => {
    const { htmlContent } = req.body;

    if (!htmlContent) {
        return res.status(400).send('HTML content is required.');
    }

    const outputDir = path.join(__dirname, 'public', 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'emailTemplate.html');
    fs.writeFile(outputPath, htmlContent, (err) => {
        if (err) {
            console.error('Error saving rendered template:', err);
            return res.status(500).send('Error saving rendered template');
        }

        res.download(outputPath, 'emailTemplate.html', (downloadErr) => {
            if (downloadErr) {
                console.error('Error sending file:', downloadErr);
                return res.status(500).send('Error downloading file');
            }
        });
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const multer = require('multer');
const simpleGit = require('simple-git');
require('dotenv').config();

const app = express();
const git = simpleGit();
const repoUrl = `https://github.com/CWDSTORAGE/videocdn.git`;

// Configure Multer for file uploads (100MB limit)
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filenames
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

// Route: Upload File to Repository
app.post('/upload', upload.single('video'), async (req, res) => {
  const filePath = `uploads/${req.file.filename}`;

  try {
    // Add and commit the file to Git repo
    await git.add(filePath);
    await git.commit(`Added video: ${req.file.filename}`);
    await git.push(repoUrl); // Push to GitHub
    res.send({ message: 'Video uploaded and pushed to GitHub!', file: req.file.filename });
  } catch (error) {
    console.error('Error pushing file to repository:', error);
    res.status(500).send('Failed to upload video.');
  }
});

// Route: Test Server
app.get('/', (req, res) => res.send('Proxy backend running!'));

// Start the server
app.listen(process.env.PORT || 3000, () => console.log('Server is live'));

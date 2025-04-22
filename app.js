const express = require('express');
const multer = require('multer');
const simpleGit = require('simple-git');
require('dotenv').config();

const app = express();
const git = simpleGit();
const PORT = process.env.PORT || 3000;

// Configure Multer for uploads (100MB limit)
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Route: Upload Video & Commit to GitHub
app.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('File upload failed.');
  }

  const filePath = `uploads/${req.file.filename}`;

  try {
    await git.add(filePath);
    await git.commit(`Added new video: ${req.file.filename}`);
    await git.push();
    
    res.send({ message: 'Video uploaded & committed to repository!', file: req.file.filename });
  } catch (error) {
    res.status(500).send('Error pushing file to GitHub.');
  }
});

// Route: Test Server
app.get('/', (req, res) => res.send('Backend is running!'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

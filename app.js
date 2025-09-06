const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const videoRoutes = require('./src/routes/video');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://ec2-3-24-177-18.ap-southeast-2.compute.amazonaws.com:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add this line after your other middleware
app.use(express.static('public'));

// Update your root route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Don't forget to require path at the top
const path = require('path');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Music Platform API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('In-memory user system initialized');
  console.log('Available test users:');
  console.log('- john@example.com (password: password123)');
  console.log('- sarah@example.com (password: password123)');
  console.log('- mike@example.com (password: password123)');
  console.log('- admin@example.com (password: password123)');
  console.log('- test@example.com (password: password123)');
});

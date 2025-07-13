import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

// database connection
const MONGO_URI = 'mongodb://localhost:27017/sampledb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// test ebdpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

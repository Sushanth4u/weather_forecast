const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
const port = 5000;

mongoose.connect('mongodb://localhost:27017/weatherApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  travelPlans: Array,
  preferences: Object,
});
const User = mongoose.model('User', UserSchema);

app.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(`https://api.mosdac.gov.in/weather?lat=${lat}&lon=${lon}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get('/uv', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(`https://api.mosdac.gov.in/uv?lat=${lat}&lon=${lon}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

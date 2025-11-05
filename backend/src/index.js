const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
// const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemSetter');
const submitRouter = require('./routes/submit');
const aiRouter = require("./routes/aiChatting");
const cors = require('cors');
const serverless = require('serverless-http');

const allowedOrigins = [
  "http://localhost:3000",
  "https://codeitup-three.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);

app.get('/test', (req, res) => {
  res.send("Hello from Backend");
});

const initializeConnection = async () => {
  try {
    await Promise.all([main()]);
    console.log("DB Connected");
  } catch (error) {
    console.log("Error: " + error);
  }
};

initializeConnection();

// ✅ Export handler for Vercel (instead of app.listen)
module.exports = app;
module.exports.handler = serverless(app);
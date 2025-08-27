const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemSetter');
const submitRouter = require('./routes/submit');
const aiRouter = require("./routes/aiChatting")
const cors = require('cors')


const allowedOrigins = [
  "http://localhost:3000",
  "https://codeitup-three.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);

app.get('/test',(req,res)=>{
    res.send("Hello from Backend");
});


const initializeConnection = async () => {
    try{
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");

        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port: " + process.env.PORT);
        })
    }
    catch(error){
        console.log("Error: "+error);
    }
}

initializeConnection();

// main()
// .then(async ()=>{
//     app.listen(process.env.PORT, ()=>{
//         console.log("Server listening at port: " + process.env.PORT);
//     })
// })
// .catch(err => console.log("Error Occured: " + err));



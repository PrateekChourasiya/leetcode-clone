const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemSetter');
const submitRouter = require('./routes/submit');


app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);

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



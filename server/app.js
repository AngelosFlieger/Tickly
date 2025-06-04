const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require('cors');
app.use(cors()); 

const mongoUrl = "mongodb+srv://aggelosflieger:admin@cluster0.e2cdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUrl).then(() => {
    console.log("Database Connected");
}).catch((e) => {
    console.log(e);
});

const signupRoute = require('./signup');
const loginRoute = require('./login');
const eventRoute = require('./eventRoute');
const userRoute = require('./eventRoute');


app.use('/', signupRoute);
app.use('/', loginRoute);
app.use('/', eventRoute);
app.use('/userRoute', userRoute);
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send({ status: "started" });
});

app.listen(5001, () => {
    console.log("node started");
});
const express = require("express");
const cors = require("cors");
const session = require('express-session')


const app = express();


// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
    session({
        secret: "IKnowTheSecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24,
            secure: false,
        },
    })
);

const router = require("./routers/routes");
app.use("/", router);

const PORT = process.env.PORT || 8080;


// Start listening
app.listen(PORT, function () {
    console.log("listening on port " + PORT);
});
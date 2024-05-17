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
            expires: 60 * 60 * 100000,
            maxAge: 60 * 60 * 100000,
            secure: false,
        },
    })
);

// app.use((req, res, next) => {
//     if (req.session && req.session.user) { // Check for existing session and user data
//         req.session.cookie.maxAge = 60 * 60 * 1000; // Reset session expiry to 1 hour upon activity
//         console.log("reseting")
//     }
//     next(); // Continue request processing
// });

const router = require("./routers/routes");
app.use("/", router);

router.get("/", (req, res) => {
    res.send("Working").status(200);
});

const PORT = process.env.PORT || 8080;


// Start listening
app.listen(PORT, function () {
    console.log("listening on port " + PORT);
});
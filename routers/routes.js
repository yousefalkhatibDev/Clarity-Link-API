const express = require("express");
const router = express.Router();
const pool = require("../helper/database").pool;
const axios = require("axios")
const jwt = require('jsonwebtoken');

const Auth = require("../models/auth");
const Project = require("../models/project")
const Bid = require("../models/bid")
const AiChat = require("../models/aiChat")
const Message = require("../models/messages");
const SrsFile = require("../models/srsFile");

router.post("/new/user/client", (req, res) => {
    Auth.RegisterClient(req, res);
});

router.post("/new/user/developer", (req, res) => {
    Auth.RegisterDeveloper(req, res);
});

router.post("/new/user/engineer", (req, res) => {
    Auth.RegisterEngineer(req, res);
});

router.post("/login", (req, res) => {
    Auth.Login(req, res);
});

router.post("/logout", (req, res) => {
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                res.json({ error: err })
            } else {
                res.send("Logged out")
            }
        })
    } else {
        res.send("Logged out")
    }
    // res.send("Logged out")
})

// Route to check if user is logged in
router.get('/isLoggedIn', (req, res) => {
    if (req.session.user) {
        res.json({ isSigned: true })
    } else {
        res.json({ isSigned: false })
    }
});

router.get("/getAccountType", (req, res) => {
    if (req.session.user) {
        const type = req.session.user.accType;
        if (type === 1) {
            res.json({ accountType: "Client", name: req.session.user.Name, isInProject: req.session.user.Current_project_id ? true : false })
        } else if (type === 2) {
            res.json({ accountType: "Developer", name: req.session.user.Name, isInProject: req.session.user.Current_project_id ? true : false })
        } else if (type === 3) {
            res.json({ accountType: "Engineer", name: req.session.user.Name, isInProject: req.session.user.Current_project_id ? true : false })
        }
    } else {
        res.json({ accountType: false })
    }
});

router.get("/getUserId", (req, res) => {
    const { userType } = req.query;

    if (userType === "Client") {
        res.json({ UserId: req.session.user.Client_id })
    } else if (userType === "Developer") {
        res.json({ UserId: req.session.user.Dev_id })
    } else if (userType === "Engineer") {
        res.json({ UserId: req.session.user.Re_id })
    }
})

router.post("/getUserNameById", (req, res) => {
    Auth.GetUserNameById(req, res)
})

router.post("/getClientNameById", (req, res) => {
    Auth.GetClientNameById(req, res)
})

router.get("/getCurrentProjectId", (req, res) => {
    res.json({ ProjectId: req.session.user.Current_project_id })
})

router.post("/create/project", (req, res) => {
    Project.CreateProject(req, res)
})

router.post("/setQuestionsInProjectQuery", (req, res) => {
    Project.SetQuestionInProjectQuery(req, res)
})

router.post("/finishProject", (req, res) => {
    Project.FinishProject(req, res)

})

router.get("/getProjectQuestions", (req, res) => {
    Project.GetProjectQuestions(req, res)
})

router.get("/getProjects", (req, res) => {
    Project.GetProjects(req, res)
})

router.get("/getProjectById", (req, res) => {
    Project.GetProjectById(req, res)
})

router.get("/getProjectByIdDetails", (req, res) => {
    Project.GetProjectByIdDetails(req, res)
})

router.get("/isProjectQueryDone", (req, res) => {
    Project.IsProjectQueryDone(req, res)
})

router.post("/create/bid", (req, res) => {
    Bid.CreateBid(req, res)
})

router.post("/accept/bid", (req, res) => {
    Bid.AcceptBid(req, res)
})

router.get("/getBids", (req, res) => {
    if (req.session.user && req.session.user.Current_project_id) {
        Bid.GetBids(req, res)
    } else {
        res.json({ projectId: false })
    }
})

router.get("/getAllBids", (req, res) => {
    Bid.GetAllBids(req, res)
})

router.post("/getApiResponse", async (req, res) => {
    AiChat.GetInputAi(req, res)
})

router.get("/isInitialInputSet", async (req, res) => {
    AiChat.IsInitialInputSet(req, res)
})

router.get("/getClientInput", async (req, res) => {
    AiChat.GetClientInput(req, res)
})

router.post("/storeMessage", (req, res) => {
    Message.StoreMessage(req, res)
})

router.post("/getMessages", (req, res) => {
    Message.GetMessages(req, res)
})

router.post("/uploadSrsFile", (req, res) => {
    SrsFile.UploadFile(req, res)
})

router.get("/isSrsFileUploaded", (req, res) => {
    SrsFile.IsFileUploaded(req, res)
})

router.get("/getSrsFile", (req, res) => {
    SrsFile.GetFile(req, res)
})

router.get("/getSrsFileName", (req, res) => {
    SrsFile.GetFileName(req, res)
})

module.exports = router;
const pool = require("../helper/database").pool;
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8094 }); // Adjust the port as needed

function broadcastFinish(message) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// WebSocket connection handling
wss.on('connection', function connection(ws) {
    console.log('WebSocket client connected 2');

    // Handle incoming messages from clients
    ws.on('message', function incoming(message) {
        // Handle incoming messages if required
        console.log('Received message from client:', message);
    });
});

module.exports = {
    CreateProject: async (req, res) => {
        try {
            const { title, description, budget, timeline, userId } = req.body
            if (title === "" || description === "" || budget === "" || timeline === "" || userId === "") {
                res.status(200).json({ ErrorMessage: "Please fill up the fields" })
                return;
            }
            const Project_id = uuidv4();
            let sqlQuery = "INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?)"
            await pool.query(
                sqlQuery,
                [
                    "",
                    Project_id,
                    title,
                    description,
                    budget,
                    timeline,
                    userId,
                    null,
                    null
                ],
                async (err, results) => {
                    if (err) res.status(200).json({ ErrorMessage: "Error While Creating A Project" });
                    if (results.affectedRows) {
                        let projectQuery = "INSERT INTO project_query VALUES (?, ?, ?, ?, ?, ?, ?)"
                        await pool.query(
                            projectQuery,
                            [
                                "",
                                Project_id,
                                0,
                                null,
                                null,
                                null,
                                null,
                            ],
                            async (err, results) => {
                                if (err) res.status(200).json({ ErrorMessage: "Error While Creating project_query" });
                                if (results.affectedRows) {
                                    let clientQuery = "UPDATE clients SET Current_project_id = ? WHERE Client_id = ?; "
                                    await pool.query(
                                        clientQuery,
                                        [
                                            Project_id,
                                            userId
                                        ],
                                        async (err, results) => {
                                            if (err) res.status(200).json({ ErrorMessage: "Error While Creating A Project" });
                                            if (results.affectedRows) {
                                                let projectQuery = "INSERT INTO project_context VALUES (?, ?, ?, ?)"
                                                await pool.query(
                                                    projectQuery,
                                                    [
                                                        "",
                                                        Project_id,
                                                        null,
                                                        null
                                                    ],
                                                    async (err, results) => {
                                                        if (err) res.status(200).json({ ErrorMessage: "Error While Creating project_context" });
                                                        if (results.affectedRows) {
                                                            req.session.user.Current_project_id = Project_id;
                                                            res.status(200).json({ results });
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    );
                                }
                            }
                        )
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    SetQuestionInProjectQuery: async (req, res) => {
        try {
            const { question1, question2, question3, question4, question5, question6, question7, question8, question9, question10, ProjectId } = req.body;
            if (question1 === "" || question2 === "" || question3 === "" || question4 === "") {
                res.status(200).json({ ErrorMessage: "Please fill all the data" });
                return;
            }
            let sqlQuery = "UPDATE project_query SET isDone = ?, q1 = ?, q2 = ?, q3 = ?, q4 = ? WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    1,
                    question1,
                    question2,
                    question3,
                    question4,
                    ProjectId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Updating Project Query" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.affectedRows) { // Check if there are rows returned
                        res.status(200).json({ results });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    GetProjects: async (req, res) => {
        try {
            let sqlQuery;
            if (req.query.userType === "Developer") {
                sqlQuery = "SELECT * FROM projects WHERE Developer IS NULL OR Developer = ''"
            } else {
                sqlQuery = "SELECT * FROM projects WHERE Engineer IS NULL OR Engineer = ''"
            }
            await pool.query(
                sqlQuery,
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    } else {
                        res.status(500).json({ ErrorMessage: "No projects found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    IsProjectQueryDone: async (req, res) => {
        try {
            const { ProjectId } = req.query
            let sqlQuery = "SELECT isDone FROM project_query WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [ProjectId],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    } else {
                        res.status(500).json({ ErrorMessage: "No projects found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        };
    },
    GetProjectQuestions: async (req, res) => {
        try {
            const { ProjectId } = req.query
            let sqlQuery = "SELECT q1, q2, q3, q4 FROM project_query WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [ProjectId],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    } else {
                        res.status(500).json({ ErrorMessage: "No projects found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        };
    },
    GetProjectById: async (req, res) => {
        try {
            const { ProjectId } = req.query
            let sqlQuery = "SELECT * FROM projects WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    ProjectId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    } else {
                        res.status(500).json({ ErrorMessage: "No projects found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    GetProjectByIdDetails: async (req, res) => {
        try {
            const { ProjectId } = req.query
            let sqlQuery = "SELECT * FROM projects WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    ProjectId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        broadcastFinish("working")
                        res.status(200).json({ results });
                    } else {
                        res.status(500).json({ ErrorMessage: "No projects found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    FinishProject: async (req, res) => {
        try {
            const { ProjectId, Project } = req.body
            let sqlQuery = "DELETE FROM projects WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    ProjectId
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.affectedRows) { // Check if there are rows 
                        let sqlQuery = "DELETE FROM project_context WHERE Project_id = ?";
                        await pool.query(
                            sqlQuery,
                            [
                                ProjectId
                            ],
                            async (err, results) => {
                                if (err) {
                                    res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                                    return; // Exit the callback function to avoid executing further code
                                }

                                if (results.affectedRows) { // Check if there are rows 
                                    let sqlQuery = "DELETE FROM project_query WHERE Project_id = ?";
                                    await pool.query(
                                        sqlQuery,
                                        [
                                            ProjectId
                                        ],
                                        async (err, results) => {
                                            if (err) {
                                                res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                                                return; // Exit the callback function to avoid executing further code
                                            }

                                            if (results.affectedRows) { // Check if there are rows 
                                                let sqlQuery = "UPDATE clients SET Current_project_id = ? WHERE Current_project_id = ?";
                                                await pool.query(
                                                    sqlQuery,
                                                    [
                                                        null,
                                                        ProjectId,
                                                    ],
                                                    async (err, results) => {
                                                        if (err) {
                                                            res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                                                            return; // Exit the callback function to avoid executing further code
                                                        }

                                                        if (results.affectedRows) { // Check if there are rows returned
                                                            let sqlQuery = "UPDATE developers SET Current_project_id = ? WHERE Current_project_id = ?";
                                                            await pool.query(
                                                                sqlQuery,
                                                                [
                                                                    null,
                                                                    ProjectId,
                                                                ],
                                                                async (err, results) => {
                                                                    if (err) {
                                                                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                                                                        return; // Exit the callback function to avoid executing further code
                                                                    }

                                                                    let sqlQuery2 = "UPDATE engineers SET Current_project_id = ? WHERE Current_project_id = ?";
                                                                    await pool.query(
                                                                        sqlQuery2,
                                                                        [
                                                                            null,
                                                                            ProjectId,
                                                                        ],
                                                                        async (err, results) => {
                                                                            if (err) {
                                                                                res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
                                                                                return; // Exit the callback function to avoid executing further code
                                                                            }
                                                                            broadcastFinish({ finish: true });
                                                                            res.status(200).json({ clear: true });
                                                                            // if (results.affectedRows) { // Check if there are rows returned

                                                                            // } else {
                                                                            //     res.status(500).json({ ErrorMessage: "No projects found" });
                                                                            // }
                                                                        }
                                                                    );

                                                                    // if (results.affectedRows) { // Check if there are rows 
                                                                    // } else {
                                                                    //     res.status(500).json({ ErrorMessage: "No projects found" });
                                                                    // }
                                                                }
                                                            );

                                                            // res.status(200).json({ results });
                                                        } else {
                                                            res.status(500).json({ ErrorMessage: "No projects found" });
                                                        }
                                                    }
                                                );
                                            } else {
                                                res.status(500).json({ ErrorMessage: "No projects found" });
                                            }
                                        }
                                    );
                                } else {
                                    res.status(500).json({ ErrorMessage: "No projects found" });
                                }
                            }
                        );

                    } else {
                        res.status(500).json({ ErrorMessage: "No projects found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
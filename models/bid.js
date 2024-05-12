const pool = require("../helper/database").pool;
const { v4: uuidv4 } = require('uuid');


module.exports = {
    CreateBid: async (req, res) => {
        try {
            const { id, solution, expectedTimeline, price, userType } = req.body;
            if (solution === "" || expectedTimeline === "" || price === "") {
                res.status(200).json({ ErrorMessage: "Please fill up the inputs" });
                return;
            }
            let userId;
            let userName = req.session.user.Name;
            let userSkills = req.session.user.Skills;
            const Bid_id = uuidv4();
            if (userType === "Developer") {
                userId = req.session.user.Dev_id
            } else if (userType === "Engineer") {
                userId = req.session.user.Re_id
            }
            let sqlQuery = "INSERT INTO bids VALUES (?,?,?,?,?,?,?,?,?,?)";
            await pool.query(
                sqlQuery,
                [
                    "",
                    Bid_id,
                    solution,
                    expectedTimeline,
                    price,
                    userType,
                    userId,
                    userName,
                    userSkills,
                    id
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Projects" });
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
    GetBids: async (req, res) => {
        try {
            const projectId = req.session.user.Current_project_id;
            let sqlQuery = "SELECT * FROM bids WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    projectId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Bids" });
                        return; // Exit the callback function to avoid executing further code
                    }
                    if (results.length > 0) { // Check if there are rows returned

                        res.status(200).json({ results });
                    } else {
                        res.status(200).json({ Response: "No Bids Were Found" });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    GetAllBids: async (req, res) => {
        try {
            let sqlQuery = "SELECT * FROM bids";
            await pool.query(
                sqlQuery,
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Bids" });
                        return; // Exit the callback function to avoid executing further code
                    }
                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    } else {
                        res.status(200).json({ Response: "No Bids Were Found" });
                    }
                }
            )
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    AcceptBid: async (req, res) => {
        try {
            const { bidType, userId, projectId } = req.body;
            let userSqlQuery;
            if (bidType === "Developer") {
                userSqlQuery = "UPDATE developers SET Current_project_id = ? WHERE Dev_id = ?"
            } else if (bidType === "Engineer") {
                userSqlQuery = "UPDATE engineers SET Current_project_id = ? WHERE Re_id = ?"
            }
            await pool.query(
                userSqlQuery,
                [
                    projectId,
                    userId
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Setting User Current Project" });
                        return; // Exit the callback function to avoid executing further code
                    }
                    if (results.affectedRows) {
                        // res.status(200).json({ results });
                        const projectSqlQuery = `UPDATE projects SET ${bidType} = ? WHERE Project_id = ?`
                        await pool.query(
                            projectSqlQuery,
                            [
                                userId,
                                projectId
                            ],
                            async (err, results) => {
                                if (err) {
                                    res.status(500).json({ ErrorMessage: "Error While Setting Project Dev/Eng" });
                                    return; // Exit the callback function to avoid executing further code
                                }
                                if (results.affectedRows) { // Check if there are rows returned
                                    const bidSqlQuery = `DELETE FROM bids WHERE Bider_id = ?`
                                    await pool.query(
                                        bidSqlQuery,
                                        [
                                            userId,
                                        ],
                                        (err, results) => {
                                            if (err) {
                                                res.status(500).json({ ErrorMessage: "Error While Setting Project Dev/Eng" });
                                                return; // Exit the callback function to avoid executing further code
                                            }
                                            if (results.affectedRows) { // Check if there are rows returned
                                                res.status(200).json({ results });
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            )
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
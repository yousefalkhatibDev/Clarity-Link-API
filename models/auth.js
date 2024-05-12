const pool = require("../helper/database").pool;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');


module.exports = {
    Login: async (req, res) => {
        try {
            const { email, password } = req.body
            if (email === "" || password === "") {
                res.status(200).json({ ErrorMessage: "Please fill in the fields" })
                return;
            }
            let sqlQuery = "SELECT email, accType FROM ( SELECT email, accType FROM engineers UNION ALL SELECT email, accType FROM clients UNION ALL SELECT email, accType FROM developers ) AS all_users WHERE email = ?;"

            await pool.query(sqlQuery, [email], async (err, results) => {
                if (err) {
                    res.status(200).json({ ErrorMessage: "Error While Logging The User" })
                    return;
                };
                if (results.length > 0) {
                    if (results[0].accType === 1) {
                        let clientQuery = "SELECT * FROM clients WHERE email = ?;"
                        await pool.query(clientQuery, [email], async (err, results) => {
                            if (err) {
                                res.status(200).json({ ErrorMessage: "Error While Logging The User" })
                                return;
                            }
                            await bcrypt.compare(password, results[0].Password, async function (err, result) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({ errorMessage: 'Error comparing password' });
                                }


                                if (result === false) {
                                    res.status(200).json({ ErrorMessage: "Incorrect password" });
                                } else {
                                    if (!req.session.user) {
                                        req.session.user = results[0];
                                        res.send("logged in")
                                    }
                                }
                            });
                        })
                    } else if (results[0].accType === 2) {
                        let devQuery = "SELECT * FROM developers WHERE email = ?;"
                        await pool.query(devQuery, [email], async (err, results) => {
                            if (err) {
                                res.status(200).json({ ErrorMessage: "Error While Logging The User" })
                                return;
                            }
                            await bcrypt.compare(password, results[0].Password, async function (err, result) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({ error: 'Error comparing password' });
                                }


                                if (result === false) {
                                    res.status(200).json({ ErrorMessage: "Incorrect password" });
                                } else {
                                    if (!req.session.user) {
                                        req.session.user = results[0];
                                        res.send("logged in")
                                    }
                                }
                            });
                        })
                    } else if (results[0].accType === 3) {
                        let devQuery = "SELECT * FROM engineers WHERE email = ?;"
                        await pool.query(devQuery, [email], async (err, results) => {
                            if (err) {
                                res.status(200).json({ ErrorMessage: "Error While Logging The User" })
                                return;
                            }
                            await bcrypt.compare(password, results[0].Password, async function (err, result) {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).json({ error: 'Error comparing password' });
                                }


                                if (result === false) {
                                    res.status(200).json({ ErrorMessage: "Incorrect password" });
                                } else {
                                    if (!req.session.user) {
                                        req.session.user = results[0];
                                        res.send("logged in")
                                    }
                                }
                            });
                        })
                    }
                } else {
                    res.status(200).json({ ErrorMessage: "Email was not found" });
                }
            }
            );
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
    GetUserNameById: async (req, res) => {
        try {
            const { userType, userId, userId2 } = req.body;
            if (userType === "Client" || userType === "Developer") {
                const sqlQuery = "SELECT Name FROM engineers WHERE Re_id = ?";
                await pool.query(
                    sqlQuery,
                    [
                        userId
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
            } else if (userType === "Engineer") {
                if (userId2 !== null) {
                    const sqlQuery = `
                    SELECT clients.Name AS client_name, developers.Name AS developer_name
                    FROM clients
                    INNER JOIN developers ON clients.Client_id = ? AND developers.Dev_id = ?
                    `;
                    await pool.query(
                        sqlQuery,
                        [
                            userId,
                            userId2
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
                } else {
                    const sqlQuery = "SELECT Name FROM clients WHERE Client_id = ?";
                    await pool.query(
                        sqlQuery,
                        [
                            userId
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
                }

            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    RegisterClient: async (req, res) => {
        try {
            const { email, name, password } = req.body
            if (email === "" || name === "" || password === "") {
                res.status(200).json({ ErrorMessage: "Please fill in the fields" });
                return;
            }
            const Client_id = uuidv4();
            let sqlQuery = "SELECT email FROM ( SELECT email FROM engineers UNION ALL SELECT email FROM clients UNION ALL SELECT email FROM developers ) AS all_users WHERE email = ?;"
            await pool.query(sqlQuery, [email], async (err, results) => {
                if (err) res.status(200).json({ ErrorMessage: "Error While Register The User" });
                if (results.length > 0) res.status(200).json({ ErrorMessage: "This User Already Exists" });
                else {
                    sqlQuery = "INSERT INTO clients VALUES (?, ?,?,?,?,?,?)";
                    await pool.query(
                        sqlQuery,
                        [
                            "",
                            Client_id,
                            email,
                            name,
                            bcrypt.hashSync(password, 5),
                            1,
                            null
                        ],
                        (err, results) => {
                            if (err) res.status(200).json({ ErrorMessage: "Error While Registering The User" });
                            if (results.affectedRows) res.status(200).json({ data: true });
                        }
                    );
                }
            }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    RegisterDeveloper: async (req, res) => {
        try {
            const { email, name, password, skill } = req.body
            if (email === "" || name === "" || password === "" || skill === "") {
                res.status(200).json({ ErrorMessage: "Please fill in the fields" });
                return;
            }
            const Dev_id = uuidv4();
            let sqlQuery = "SELECT email FROM ( SELECT email FROM engineers UNION ALL SELECT email FROM clients UNION ALL SELECT email FROM developers ) AS all_users WHERE email = ?;"
            await pool.query(sqlQuery, [email], async (err, results) => {
                if (err) res.status(200).json({ ErrorMessage: "Error While Register The User" });
                if (results.length > 0) res.status(200).json({ ErrorMessage: "This User Already Exists" });
                else {
                    sqlQuery = "INSERT INTO developers VALUES (?,?,?,?,?,?,?,?)";
                    await pool.query(
                        sqlQuery,
                        [
                            "",
                            Dev_id,
                            email,
                            name,
                            bcrypt.hashSync(password, 5),
                            skill,
                            2,
                            null
                        ],
                        (err, results) => {
                            if (err) res.status(200).json({ ErrorMessage: "Error While Registering The User" });
                            if (results.affectedRows) res.status(200).json({ data: true });
                        }
                    );
                }
            }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    RegisterEngineer: async (req, res) => {
        try {
            const { email, name, password, skill } = req.body
            if (email === "" || name === "" || password === "" || skill === "") {
                res.status(200).json({ ErrorMessage: "Please fill in the fields" });
                return;
            }
            const Re_id = uuidv4();
            let sqlQuery = "SELECT email FROM ( SELECT email FROM engineers UNION ALL SELECT email FROM clients UNION ALL SELECT email FROM developers ) AS all_users WHERE email = ?;"
            await pool.query(sqlQuery, [email], async (err, results) => {
                if (err) res.status(200).json({ ErrorMessage: "Error While Register The User" });
                if (results.length > 0) res.status(200).json({ ErrorMessage: "This User Already Exists" });
                else {
                    sqlQuery = "INSERT INTO engineers VALUES (?,?,?,?,?,?,?,?)";
                    await pool.query(
                        sqlQuery,
                        [
                            "",
                            Re_id,
                            email,
                            name,
                            bcrypt.hashSync(password, 5),
                            skill,
                            3,
                            null
                        ],
                        (err, results) => {
                            if (err) res.status(200).json({ ErrorMessage: "Error While Registering The User" });
                            if (results.affectedRows) res.status(200).json({ data: true });
                        }
                    );
                }
            }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
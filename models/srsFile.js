const pool = require("../helper/database").pool;
const PDFDocument = require('pdfkit');
const fs = require('fs');



module.exports = {
    UploadFile: async (req, res) => {
        try {
            const { base64, fileName } = req.body;
            const decodedData = Buffer.from(base64, 'base64');
            const file = fs.writeFileSync(`C:/PDFS/${fileName}`, decodedData, { encoding: 'base64' });
            const projectId = req.session.user.Current_project_id;

            let sqlQuery = "UPDATE project_context SET Final_context = ? WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    `C:/PDFS/${fileName}`,
                    projectId
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Storing file" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.affectedRows) { // Check if there are rows affected
                        // Broadcast message insertion notification to all WebSocket clients
                        res.status(200).json({ results });
                    }
                }
            );
        } catch (err) {
            console.log(err)
        }
    },
    IsFileUploaded: async (req, res) => {
        try {
            const projectId = req.session.user.Current_project_id;

            let sqlQuery = "SELECT Final_context FROM project_context WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    projectId
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Storing file" });
                        console.log(err)
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows affected
                        // Broadcast message insertion notification to all WebSocket clients
                        if (results[0].Final_context !== null) {
                            res.status(200).json({ isFileUploaded: true });
                        } else {
                            res.status(200).json({ isFileUploaded: false });
                        }
                    }

                }
            );
        } catch (err) {
            console.log(err)
        }
    },
    GetFile: async (req, res) => {
        try {
            const projectId = req.session.user.Current_project_id;
            // const projectId = "1bf3f41c-3cb3-47cd-8b2e-ea75e5528c30";


            let sqlQuery = "SELECT Final_context FROM project_context WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    projectId
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Storing file" });
                        console.log(err)
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows affected
                        const filePath = results[0].Final_context

                        fs.readFile(filePath, (err, data) => {
                            if (err) {
                                return res.status(500).json({ error: 'Failed to retrieve file' });
                            }
                            res.contentType('application/pdf'); // Set content type
                            res.send(data); // Send file content
                        });
                        // Broadcast message insertion notification to all WebSocket clients
                    }

                }
            );
        } catch (err) {
            console.log(err)
        }
    },
    GetFileName: async (req, res) => {
        try {
            const projectId = req.session.user.Current_project_id;
            // const projectId = "1bf3f41c-3cb3-47cd-8b2e-ea75e5528c30";


            let sqlQuery = "SELECT Final_context FROM project_context WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    projectId
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Storing file" });
                        console.log(err)
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows affected
                        res.json({ results })
                        // Broadcast message insertion notification to all WebSocket clients
                    }

                }
            );
        } catch (err) {
            console.log(err)
        }
    }
}
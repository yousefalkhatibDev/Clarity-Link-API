const OpenAI = require('openai');
const pool = require("../helper/database").pool;


const client = new OpenAI({
    apiKey: "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", // This is the default and can be omitted
});

module.exports = {
    GetInputAi: async (req, res) => {
        try {
            const { messageUpdated } = req.body

            const params = {
                messages: [{ role: 'user', content: messageUpdated }],
                model: 'gpt-3.5-turbo',
            };

            client.chat.completions.create(params)
                .then(async (chatCompletion) => {
                    const completionMessage = chatCompletion.choices[0].message.content;
                    const projectId = req.session.user.Current_project_id;
                    let sqlQuery = "UPDATE project_context SET Initial_context = ? WHERE Project_id = ?";
                    await pool.query(
                        sqlQuery,
                        [
                            completionMessage,
                            projectId
                        ],
                        (err, results) => {
                            if (err) {
                                res.status(500).json({ ErrorMessage: "Error While Updating Project Query" });
                                return; // Exit the callback function to avoid executing further code
                            }

                            if (results.affectedRows) { // Check if there are rows returned
                                res.status(200).json({ completionMessage });
                            }
                        }
                    );
                    // res.status(200).json({ msg: completionMessage })
                })
                .catch(error => {
                    console.log(error)
                    res.status(200).json({ ErrorMessage: "Error While Sending message" })
                });
        } catch (err) {
            console.log(err)
        }
    },
    IsInitialInputSet: async (req, res) => {
        try {
            const projectId = req.session.user.Current_project_id;
            let sqlQuery = "SELECT Initial_context FROM project_context WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    projectId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Updating Project Query" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    }
                }
            );

        } catch (err) {
            console.log(err)
        }
    },
    GetClientInput: async (req, res) => {
        try {
            const projectId = req.session.user.Current_project_id;
            let sqlQuery = "SELECT Initial_context FROM project_context WHERE Project_id = ?";
            await pool.query(
                sqlQuery,
                [
                    projectId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Updating Project Query" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.length > 0) { // Check if there are rows returned
                        res.status(200).json({ results });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
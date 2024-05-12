const pool = require("../helper/database").pool;
const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8082 }); // Adjust the port as needed

function broadcastMessage(message) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// WebSocket connection handling
wss.on('connection', function connection(ws) {
    console.log('WebSocket client connected');

    // Handle incoming messages from clients
    ws.on('message', function incoming(message) {
        // Handle incoming messages if required
        console.log('Received message from client:', message);
    });
});

module.exports = {
    StoreMessage: async (req, res) => {
        try {
            const { message, incomingId, outgoingId } = req.body;

            // Insert the message into the database
            let sqlQuery = "INSERT INTO messages VALUES (?, ?, ?, ?)";
            await pool.query(
                sqlQuery,
                [
                    "",
                    incomingId,
                    outgoingId,
                    message
                ],
                async (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Storing Message" });
                        return; // Exit the callback function to avoid executing further code
                    }

                    if (results.affectedRows) { // Check if there are rows affected
                        // Broadcast message insertion notification to all WebSocket clients
                        broadcastMessage({ type: 'new_message', data: { id: results.insertId, incoming_msg_id: incomingId, outgoing_msg_id: outgoingId, msg: message } });

                        res.status(200).json({ results });
                    }
                }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    GetMessages: async (req, res) => {
        try {
            const { userId, userId2 } = req.body;
            let sqlQuery = `
                SELECT * FROM messages
                WHERE (incoming_msg_id = ? AND outgoing_msg_id = ?)
                OR (incoming_msg_id = ? AND outgoing_msg_id = ?)
            `;
            await pool.query(
                sqlQuery,
                [
                    userId,
                    userId2,
                    userId2,
                    userId
                ],
                (err, results) => {
                    if (err) {
                        res.status(500).json({ ErrorMessage: "Error While Fetching Messages" });
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
};
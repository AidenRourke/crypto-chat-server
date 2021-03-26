require('dotenv').config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const PORT = process.env.PORT || 4000;
const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});
const messageDao = require("./MessagesDAO");
const decode = require("./decode_verify_jwt");
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

app.use(express.json());

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    let userID = socket.handshake.auth.userID; // Delete this eventually

    if (token) {
        try {
            const decodedToken = decode(token);
            console.log(decodedToken);
            userID = decodedToken["cognito:username"];
        } catch (e) {
            return next(new Error("invalid token"));
        }
    }

    if (!userID) {
        return next(new Error("invalid username"));
    }

    socket.userID = userID;
    next();
});

const getUsers = () => {
    const users = [];
    for (let [, socket] of io.of("/").sockets) {
        users.push({
            userID: socket.userID
        });
    }
    return users;
};

// The request requires a user_id parameter to work
app.post("/query-messages", async (req, res) => {
    const body = req.body;
    if (body && body.user_id) {
        missedMessages = await messageDao.getMessages(body.user_id);
        messageDao.deleteMessages(missedMessages)
        res.status(200).json({
            messages: missedMessages
        });
    } else {
        return res.status(400).json({
            error: "Missing user ID."
        })
    }
});

io.on("connection", async socket => {
    const users = getUsers();
    console.log(`Connecting: ${socket.userID}`);
    console.log("User list:");
    console.log(users);
    socket.join(socket.userID);

    // Emit missed messages to the user

    socket.on(NEW_CHAT_MESSAGE_EVENT, ({to, content}) => {
        const users = getUsers();

        console.log("User list:");
        console.log(users);
        currentTimestamp = Date.now();

        console.log(`Handling message from: ${socket.userID} --> ${to}`);
        if (users.some(user => user.userID === to)) {
            socket.to(to).emit(NEW_CHAT_MESSAGE_EVENT, {
                to: to,
                from: socket.userID,
                content
            });
        } else {
            // Store messages
            console.log("user must be disconnected");
            // Will need to be changed to use the real user id, after the login page is made
            messageDao.putMessage(to, currentTimestamp, socket.userID, content.body)
        }
    });

    socket.on("disconnect", async () => {
        const users = getUsers();
        console.log(`Disconnecting: ${socket.userID}`);
        console.log("User list:");
        console.log(users);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

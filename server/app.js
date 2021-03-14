const app = require("express")();
const server = require("http").createServer(app);
const PORT = process.env.PORT || 4000;
const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});
const messageDao = require("./MessagesDAO");

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.use((socket, next) => {
    const userID = socket.handshake.auth.userID;
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

io.on("connection", socket => {
    const users = getUsers();
    console.log(`Connecting: ${socket.userID}`);
    console.log("User list:");
    console.log(users);
    socket.join(socket.userID);

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
            messageDao.putMessage(socket.userID, currentTimestamp, to, content)
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

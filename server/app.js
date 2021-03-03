const app = require('express')();
const server = require("http").createServer(app);
const PORT = process.env.PORT || 4000;
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
});

const getUsers = () => {
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            userID: id,
            username: socket.username,
        });
    }
    return users;
};

io.on("connection", (socket) => {
    socket.on(NEW_CHAT_MESSAGE_EVENT, ({to, content}) => {
        const users = getUsers();

        console.log("User list:");
        console.log(users);

        const receiver = users.find(user => user.username === to);
        const sender = users.find(user => user.userID === socket.id);

        console.log(`Handling message from: ${sender.username} to: ${receiver.username}`)

        io.to(receiver.userID).emit(NEW_CHAT_MESSAGE_EVENT, {
            from: sender.username,
            content,
        });
    });

    /*
    * Group messaging
    * Create room on new group event
    * Adding users -
    * */
    socket.on("disconnect", () => {
        const users = getUsers();
        console.log(`Disconnecting: ${socket.id}`);
        console.log("User list:");
        console.log(users);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
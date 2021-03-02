import React from "react";

import "./ChatRoom.css";
import useChat from "../useChat";

const ChatRoom = (props) => {
    const {roomId} = props.match.params;
    const {userName} = props.location.state;
    const {messages, sendMessage} = useChat(roomId);
    const [newMessage, setNewMessage] = React.useState("");

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        console.log(userName)
        sendMessage(newMessage, userName);
        setNewMessage("");
    };

    return (
        <div className="chat-room-container">
            <h1 className="room-name">Room: {roomId}</h1>
            <div className="messages-container">
                <ol className="messages-list">
                    {messages.map((message, i) => (
                        <div>
                            { !message.ownedByCurrentUser && 
                            <li
                                key={i}
                                className={`message-item received-name"`}
                            > {message.senderName} </li>
                            }
                            
                            <li
                                key={i}
                                className={`message-item ${
                                    message.ownedByCurrentUser ? "my-message" : "received-message"
                                    }`}
                            >
                                {message.body}
                            </li>
                        </div>
                    ))}
                </ol>
            </div>
            <textarea
                value={newMessage}
                onChange={handleNewMessageChange}
                placeholder="Write message..."
                className="new-message-input-field"
            />
            <button onClick={handleSendMessage} className="send-message-button">
                Send
            </button>
        </div>
    );
};

export default ChatRoom;
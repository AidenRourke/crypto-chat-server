import React from "react";

import "./ChatRoom.css";
import useChat from "../useChat";

const ChatRoom = (props) => {
    const [newMessage, setNewMessage] = React.useState("");

    const {to} = props.match.params;
    const {username} = props.location.state;

    const {messages, sendMessage} = useChat(username);

    const coversation = messages[to] || [];

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(to, newMessage);
        setNewMessage("");
    };

    return (
        <div className="chat-room-container">
            <h1 className="room-name">User: {to}</h1>
            <div className="messages-container">
                <ol className="messages-list">
                    {coversation.map((message, i) => {
                            const fromSelf = message.from === username;
                            return <div key={i}>
                                {!fromSelf &&
                                    <label className={`message-item received-name`}>{message.from}</label>
                                }

                                <li className={`message-item ${fromSelf ? "my-message" : "received-message"}`}>
                                    {message.content}
                                </li>
                            </div>
                        })
                    }
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
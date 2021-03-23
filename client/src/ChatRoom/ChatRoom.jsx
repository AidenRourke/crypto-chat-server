import React from "react";

import "./ChatRoom.css";

const ChatRoom = props => {
    const [newMessage, setNewMessage] = React.useState("");

    const {to, conversation, sendMessage, disconnect} = props;

    const handleNewMessageChange = event => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(to, newMessage);
        setNewMessage("");
    };
    const handleSocketDisconnect = () => {
        disconnect()
    };

    return (
        <div className="chat-room-container">
            <h2 className="room-name">Conversation With: {to}</h2>
            <div className="messages-container">
                <ol className="messages-list">
                    {conversation.map((message, i) => {
                        return (
                            <div key={i}>
                                {!message.fromSelf && (
                                    <label className={`message-item received-name`}>
                                        {to}
                                    </label>
                                )}

                                <li
                                    className={`message-item ${
                                        message.fromSelf ? "my-message" : "received-message"
                                        }`}
                                >
                                    {message.content}
                                </li>
                            </div>
                        );
                    })}
                </ol>
            </div>
            <textarea
                value={newMessage}
                onChange={handleNewMessageChange}
                placeholder="Write message..."
                className="new-message-input-field"
            />
            <button onClick={handleSendMessage} className="send-message-button" disabled={!to}>
                Send
            </button>
            <button onClick={handleSocketDisconnect} className="send-message-button">
                Disconnect Socket
            </button>
        </div>
    );
};

export default ChatRoom;

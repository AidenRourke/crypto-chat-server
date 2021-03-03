import React from "react";

import "./ChatRoom.css";

const ChatRoom = props => {
    const [newMessage, setNewMessage] = React.useState("");

    const {to, username, conversation, sendMessage} = props;

    const handleNewMessageChange = event => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(to, newMessage);
        setNewMessage("");
    };

    return (
        <div className="chat-room-container">
            <h2 className="room-name">Conversation With: {to}</h2>
            <div className="messages-container">
                <ol className="messages-list">
                    {conversation.map((message, i) => {
                        const fromSelf = message.from === username;
                        return (
                            <div key={i}>
                                {!fromSelf && (
                                    <label className={`message-item received-name`}>
                                        {message.from}
                                    </label>
                                )}

                                <li
                                    className={`message-item ${
                                        fromSelf ? "my-message" : "received-message"
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
        </div>
    );
};

export default ChatRoom;

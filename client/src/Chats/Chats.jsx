import React, { useState } from "react";
import useChat from "../useChat";
import ChatRoom from "../ChatRoom/ChatRoom";

import "./Chats.css";

const Chats = props => {
  const [value, setValue] = useState("");
  const [to, setTo] = useState("");

  const { username } = props.location.state;

  const { messages, sendMessage } = useChat(username);

  return (
    <div className="chats-container">
      <div className="conversations-container">
        <h1>WELCOME: {username}</h1>
        <h2 className="user-name">Receiver:</h2>
        <input
          type="text"
          placeholder="Receiver Name"
          value={value}
          onChange={event => setValue(event.target.value)}
          className="text-input-field"
        />
        <h2>Conversation List</h2>
        <div className="conversations">
          {Object.keys(messages).map(receiver => (
            <button
              className="select-conversation-button"
              onClick={() => setValue(receiver)}
            >
              {receiver}
            </button>
          ))}
        </div>
        <button
          className="start-conversation-button"
          onClick={() => setTo(value)}
        >
          Enter Conversation
        </button>
      </div>
      <ChatRoom
        to={to}
        username={username}
        conversation={messages[to] || []}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default Chats;

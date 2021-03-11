import React, {useState} from "react";
import useChat from "../useChat";
import ChatRoom from "../ChatRoom/ChatRoom";
import {decode} from "base64-arraybuffer"


import "./Chats.css";

const loadTextFile = file => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result)
        };
        reader.readAsText(file)
    })
};

const Chats = props => {
    const [to, setTo] = useState("")
    const {username} = props.location.state;

    const {messages, sendMessage, processPreKey, downloadKeys} = useChat(username);

    const handleSubmit = e => {
        e.preventDefault();

        const to = e.target[0].value;
        const preKeyBundle = e.target[1].files[0];

        loadTextFile(preKeyBundle).then((r) => {
            const preKeyBundle = JSON.parse(r);
            preKeyBundle.identityKey = decode(preKeyBundle.identityKey);
            preKeyBundle.preKey.publicKey = decode(preKeyBundle.preKey.publicKey);
            preKeyBundle.signedPreKey.publicKey = decode(preKeyBundle.signedPreKey.publicKey);
            preKeyBundle.signedPreKey.signature = decode(preKeyBundle.signedPreKey.signature);

            processPreKey(preKeyBundle, to);
        })

        setTo(to);
        e.target.reset();
    };

    return (
        <div className="chats-container">
            <div className="conversations-container">
                <h2 className="user-name">WELCOME: {username}</h2>
                <button onClick={() => downloadKeys()}>Download Keys</button>
                {Object.keys(messages).map(conversation => <button key={conversation}
                                                                   onClick={() => setTo(conversation)}
                                                                   className="select-conversation-button">{conversation}</button>)}
                <form onSubmit={handleSubmit} className="conversations">
                    <label>To:</label>
                    <input type="text" name="to"/>
                    <label>Pre Key Bundle:</label>
                    <input type="file" name="preKey"/>
                    <button className="start-conversation-button">Establish Session</button>
                </form>
            </div>
            <ChatRoom
                to={to}
                conversation={messages[to] || []}
                sendMessage={sendMessage}
            />
        </div>
    );
};

export default Chats;

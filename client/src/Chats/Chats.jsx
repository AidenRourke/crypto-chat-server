import React, {useState} from "react";
import useChat from "../useChat";
import ChatRoom from "../ChatRoom/ChatRoom";


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

const loadBlobFile = file => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result)
        };
        reader.readAsArrayBuffer(file)
    })
};

const Chats = props => {
    const [to, setTo] = useState("")
    const {username} = props.location.state;

    const {messages, sendMessage, processPreKey, downloadKeys} = useChat(username);

    const handleSubmit = e => {
        e.preventDefault();

        const to = e.target[0].value;
        const json = e.target[1].files[0];
        const identityKey = e.target[2].files[0];
        const preKey = e.target[3].files[0];
        const signedKey = e.target[4].files[0];
        const signature = e.target[5].files[0];

        Promise.all([
            loadTextFile(json),
            loadBlobFile(identityKey),
            loadBlobFile(preKey),
            loadBlobFile(signedKey),
            loadBlobFile(signature)
        ]).then(async (r) => {
            const preKeyBundle = JSON.parse(r[0]);
            preKeyBundle.identityKey = r[1];
            preKeyBundle.preKey.publicKey = r[2];
            preKeyBundle.signedPreKey.publicKey = r[3];
            preKeyBundle.signedPreKey.signature = r[4];

            processPreKey(preKeyBundle, to);
        });

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
                    <label>JSON:</label>
                    <input type="file" name="json"/>
                    <label>Identity Key:</label>
                    <input type="file" name="idKey"/>
                    <label>Pre Key:</label>
                    <input type="file" name="preKey"/>
                    <label>Signed PreKey:</label>
                    <input type="file" name="signedKey"/>
                    <label>PreKey Signature:</label>
                    <input type="file" name="signature"/>
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

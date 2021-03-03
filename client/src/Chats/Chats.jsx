import React from "react";
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
    const {username, receiver} = props.location.state;

    const {messages, sendMessage, processPreKey, downloadKeys} = useChat(username);

    const handleSubmit = e => {
        e.preventDefault();

        const json = e.target[0].files[0];
        const identityKey = e.target[1].files[0];
        const preKey = e.target[2].files[0];
        const signedKey = e.target[3].files[0];
        const signature = e.target[4].files[0];

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

            processPreKey(preKeyBundle, receiver);
        });

        e.target.reset();
    };

    return (
        <div className="chats-container">
            <div className="conversations-container">
                <h1>WELCOME: {username}</h1>
                <button onClick={() => downloadKeys()}>Download Keys</button>
                <h2 className="user-name">Receiver:</h2>
                <form onSubmit={handleSubmit}>
                    <label>JSON:</label><br/>
                    <input type="file" name="json"/><br/>
                    <label>Identity Key:</label><br/>
                    <input type="file" name="idKey"/><br/>
                    <label>Pre Key:</label><br/>
                    <input type="file" name="preKey"/><br/>
                    <label>Signed PreKey:</label><br/>
                    <input type="file" name="signedKey"/><br/>
                    <label>PreKey Signature:</label><br/>
                    <input type="file" name="signature"/><br/>
                    <button>Submit</button>
                </form>
            </div>
            <ChatRoom
                to={receiver}
                conversation={messages}
                sendMessage={sendMessage}
            />
        </div>
    );
};

export default Chats;

import React, {useState, useEffect} from "react";
import useChat from "../useChat";
import ChatRoom from "../ChatRoom/ChatRoom";
import {decode} from "base64-arraybuffer"
import QRCode from "react-qr-code";


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
    const [to, setTo] = useState("");
    const [preKeyString, setPreKeyString] = useState();
    const {username} = props.location.state;

    const {messages, sendMessage, processPreKey, getPreKeysString} = useChat(username);

    useEffect(() => {
        const getPreKeyString = async () => {
            const preKeyString = await getPreKeysString();
            setPreKeyString(preKeyString)
        }
        getPreKeyString()
    }, [])

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
        });

        setTo(to);
        e.target.reset();
    };

    const downloadKeys = async () => {
        const a = document.createElement("a");
        const blob = new Blob([preKeyString]);
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "preKeyBundle";
        a.click();
    };

    return (
        <div className="chats-container">
            <div className="conversations-container">
                <h2 className="user-name">WELCOME: {username}</h2>
                {preKeyString && <div className="pre-keys">
                    <QRCode size={100} value={preKeyString}/>
                    <button onClick={() => downloadKeys()}>Download Keys</button>
                </div>}
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

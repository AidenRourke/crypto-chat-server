import React, {useState} from "react";
import useChat from "../useChat";
import ChatRoom from "../ChatRoom/ChatRoom";

import SignalProtocolStore from "./store"

import "./Chats.css";

const {libsignal} = window;
const {util} = window;

const KeyHelper = libsignal.KeyHelper;

function generateIdentity(store) {
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]).then(function (result) {
        store.put('identityKey', result[0]);
        store.put('registrationId', result[1]);
    });
}

function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    return Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId()
    ]).then(function (result) {
        var identity = result[0];
        var registrationId = result[1];

        return Promise.all([
            KeyHelper.generatePreKey(preKeyId),
            KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
        ]).then(function (keys) {
            var preKey = keys[0]
            var signedPreKey = keys[1];

            store.storePreKey(preKeyId, preKey.keyPair);
            store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

            return {
                identityKey: identity.pubKey,
                registrationId: registrationId,
                preKey: {
                    keyId: preKeyId,
                    publicKey: preKey.keyPair.pubKey
                },
                signedPreKey: {
                    keyId: signedPreKeyId,
                    publicKey: signedPreKey.keyPair.pubKey,
                    signature: signedPreKey.signature
                }
            };
        });
    });
}

var ALICE_ADDRESS = new libsignal.SignalProtocolAddress("1001", 1);
var BOB_ADDRESS = new libsignal.SignalProtocolAddress("1002", 1);

var aliceStore = new SignalProtocolStore();

var bobStore = new SignalProtocolStore();
var bobPreKeyId = 1337;
var bobSignedKeyId = 1;

var Curve = libsignal.Curve;

Promise.all([
    generateIdentity(aliceStore),
    generateIdentity(bobStore),
]).then(function () {
    return generatePreKeyBundle(bobStore, bobPreKeyId, bobSignedKeyId);
}).then(function (preKeyBundle) {
    var builder = new libsignal.SessionBuilder(aliceStore, BOB_ADDRESS);
    return builder.processPreKey(preKeyBundle).then(function () {

        var originalMessage = util.str2ab("my message ......");
        var aliceSessionCipher = new libsignal.SessionCipher(aliceStore, BOB_ADDRESS);
        var bobSessionCipher = new libsignal.SessionCipher(bobStore, ALICE_ADDRESS);

        aliceSessionCipher.encrypt(originalMessage).then(function (ciphertext) {

            // check for ciphertext.type to be 3 which includes the PREKEY_BUNDLE
            return bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');

        }).then(function (plaintext) {

            alert(util.ab2str(plaintext));

        });

        // bobSessionCipher.encrypt(originalMessage).then(function (ciphertext) {
        //
        //     return aliceSessionCipher.decryptWhisperMessage(ciphertext.body, 'binary');
        //
        // }).then(function (plaintext) {
        //
        //     alert(util.ab2str(plaintext));
        //
        // });

    });
});

const Chats = props => {
    const [value, setValue] = useState("");
    const [to, setTo] = useState("");

    const {username} = props.location.state;

    const {messages, sendMessage} = useChat(username);

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
                        <button key={receiver}
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
                conversation={messages[to] || []}
                sendMessage={sendMessage}
            />
        </div>
    );
};

export default Chats;

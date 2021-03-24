import React, {useEffect, useRef, useState} from "react";
import io from "socket.io-client";
import {encode} from "base64-arraybuffer"

import SignalProtocolStore from "./store";

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const SOCKET_SERVER_URL = "http://Gettingstartedapp-env.eba-sm3mz4hp.us-east-2.elasticbeanstalk.com";
// const SOCKET_SERVER_URL = "http://localhost:4000";

const DEVICE_ID = 0; // Each one of a users devices has a different device ID (and their own conversation)

const {util, libsignal} = window;
const userStore = new SignalProtocolStore();

const KeyHelper = libsignal.KeyHelper;

function generateIdentity(store) {
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId()
    ]).then(function (result) {
        store.put("identityKey", result[0]);
        store.put("registrationId", result[1]);
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
            KeyHelper.generateSignedPreKey(identity, signedPreKeyId)
        ]).then(function (keys) {
            var preKey = keys[0];
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

const useChat = username => {
    const [messages, setMessages] = useState({});
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: {
                userID: username // Replace this with token eventually
            }
        });

        socketRef.current.on(
            NEW_CHAT_MESSAGE_EVENT,
            async ({to, from, content}) => {
                const FROM_ADDRESS = new libsignal.SignalProtocolAddress(from, DEVICE_ID);
                const sessionCipher = new libsignal.SessionCipher(
                    userStore,
                    FROM_ADDRESS
                );

                console.log("Message:");
                console.log(content);

                let message;
                if (content.type === 3) {
                    const plaintext = await sessionCipher.decryptPreKeyWhisperMessage(
                        content.body,
                        "binary"
                    );
                    message = util.ab2str(plaintext);
                } else {
                    const plaintext = await sessionCipher.decryptWhisperMessage(
                        content.body,
                        "binary"
                    );
                    message = util.ab2str(plaintext);

                }
                setMessages(messages => {
                    const prevConversation = messages[from] || [];
                    return {
                        ...messages,
                        [from]: [...prevConversation, {content: message, fromSelf: false}]
                    };
                });
            }
        );

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const sendMessage = (to, content) => {
        const plaintext = util.str2ab(content);

        const TO_ADDRESS = new libsignal.SignalProtocolAddress(to, DEVICE_ID);
        const sessionCipher = new libsignal.SessionCipher(
            userStore,
            TO_ADDRESS
        );

        sessionCipher.encrypt(plaintext).then(cipherText => {
            socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
                content: cipherText,
                to
            });
        });

        setMessages(messages => {
            const prevConversation = messages[to] || [];
            return {
                ...messages,
                [to]: [...prevConversation, {content, fromSelf: true}]
            };
        });
    };

    const getPreKeysString = async () => {
        // PreKeyId and signedKeyId will eventually be unique identifiers
        await generateIdentity(userStore);
        const preKeyId = 1;
        const signedKeyId = 1;
        const preKeyBundle = await generatePreKeyBundle(
            userStore,
            preKeyId,
            signedKeyId
        );

        console.log(preKeyBundle)

        preKeyBundle.identityKey = encode(preKeyBundle.identityKey);
        preKeyBundle.preKey.publicKey = encode(preKeyBundle.preKey.publicKey);
        preKeyBundle.signedPreKey.publicKey = encode(preKeyBundle.signedPreKey.publicKey);
        preKeyBundle.signedPreKey.signature = encode(preKeyBundle.signedPreKey.signature);

        return JSON.stringify(preKeyBundle)
    };

    const processPreKey = async (preKeyBundle, to) => {
        console.log(preKeyBundle);
        const TO_ADDRESS = new libsignal.SignalProtocolAddress(to, DEVICE_ID);
        const builder = new libsignal.SessionBuilder(userStore, TO_ADDRESS);

        await builder.processPreKey(preKeyBundle);
    };

    const disconnectFromSocket = () => {
        console.log("Socket: " + socketRef.current.id + " has been disconnected.");
        socketRef.current.disconnect();
    };

    return {messages, sendMessage, getPreKeysString, processPreKey, disconnectFromSocket};
};

export default useChat;

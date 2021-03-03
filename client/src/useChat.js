import React, {useEffect, useRef, useState} from "react";
import io from "socket.io-client";

import SignalProtocolStore from "./store";

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const SOCKET_SERVER_URL =
    "http://Gettingstartedapp-env.eba-sm3mz4hp.us-east-2.elasticbeanstalk.com";
// const SOCKET_SERVER_URL = "http://localhost:4000";

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
    const [messages, setMessages] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        generateIdentity(userStore);

        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: {
                userID: username // Replace this with token eventually
            }
        });

        socketRef.current.on(
            NEW_CHAT_MESSAGE_EVENT,
            async ({to, from, content}) => {
                const SENDER_ADDRESS = new libsignal.SignalProtocolAddress(from, 1);
                const sessionCipher = new libsignal.SessionCipher(
                    userStore,
                    SENDER_ADDRESS
                );

                console.log("Message:")
                console.log(content)

                if (content.type === 3) {
                    const plaintext = await sessionCipher.decryptPreKeyWhisperMessage(
                        content.body,
                        "binary"
                    );
                    const message = util.ab2str(plaintext);
                    setMessages(messages => {
                        return [...messages, {content: message, fromSelf: false}];
                    });
                } else {
                    const plaintext = await sessionCipher.decryptWhisperMessage(
                        content.body,
                        "binary"
                    );
                    const message = util.ab2str(plaintext);
                    setMessages(messages => {
                        return [...messages, {content: message, fromSelf: false}];
                    });
                }
            }
        );

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const sendMessage = (to, content) => {
        const plaintext = util.str2ab(content);

        const RECEIVER_ADDRESS = new libsignal.SignalProtocolAddress(to, 1);
        const sessionCipher = new libsignal.SessionCipher(
            userStore,
            RECEIVER_ADDRESS
        );

        sessionCipher.encrypt(plaintext).then(cipherText => {
            socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
                content: cipherText,
                to
            });
        });

        setMessages(messages => {
            return [...messages, {content, fromSelf: true}];
        });
    };

    const downloadKeys = async () => {
        const preKeyId = 1;
        const signedKeyId = 1;
        const preKeyBundle = await generatePreKeyBundle(
            userStore,
            preKeyId,
            signedKeyId
        );
        console.log(preKeyBundle);

        const a = document.createElement("a");

        let blob = new Blob([preKeyBundle.identityKey]);
        let url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "identityKey";
        a.click();

        blob = new Blob([preKeyBundle.preKey.publicKey]);
        url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "preKey";
        a.click();

        blob = new Blob([preKeyBundle.signedPreKey.publicKey]);
        url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "signedPreKey";
        a.click();

        blob = new Blob([preKeyBundle.signedPreKey.signature]);
        url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "signature";
        a.click();

        blob = new Blob([JSON.stringify(preKeyBundle)]);
        url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "json";
        a.click();
    };

    const processPreKey = async (preKeyBundle, receiver) => {
        console.log(preKeyBundle);
        const RECEIVER_ADDRESS = new libsignal.SignalProtocolAddress(receiver, 1); // Device ID is to differentiate between user devices
        const builder = new libsignal.SessionBuilder(userStore, RECEIVER_ADDRESS);

        await builder.processPreKey(preKeyBundle);
    };

    return {messages, sendMessage, downloadKeys, processPreKey};
};

export default useChat;

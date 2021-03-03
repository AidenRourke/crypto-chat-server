import React, {useEffect, useRef, useState} from "react";
import io from "socket.io-client";

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const SOCKET_SERVER_URL = "http://Gettingstartedapp-env.eba-sm3mz4hp.us-east-2.elasticbeanstalk.com";
// const SOCKET_SERVER_URL = "http://localhost:4000";

const useChat = username => {
    const [messages, setMessages] = useState({});
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: {
                userID: username // Replace this with token eventually
            }
        });

        socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, ({from, content}) => {
            setMessages(messages => {
                const prevMessages = messages[from] || [];
                return {
                    ...messages,
                    [from]: [...prevMessages, {content, from}]
                };
            });
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const sendMessage = (to, content) => {
        socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
            content,
            to
        });
        setMessages(messages => {
            const prevMessages = messages[to] || [];
            return {
                ...messages,
                [to]: [...prevMessages, {content, from: username}]
            };
        });
    };

    return {messages, sendMessage};
};

export default useChat;

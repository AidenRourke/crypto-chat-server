import React, {useState} from "react";
import {Link} from "react-router-dom";

import "./Home.css";

const Home = () => {
    const [username, setUsername] = useState("");
    const [receiver,  setReceiver] = useState("")

    return (
        <div className="home-container">
            <input
                type="text"
                placeholder="Sender Name"
                value={username}
                onChange={event => setUsername(event.target.value)}
                className="text-input-field"
            />

            <input
                type="text"
                placeholder="Receiver Name"
                value={receiver}
                onChange={event => setReceiver(event.target.value)}
                className="text-input-field"
            />

            <Link
                to={{pathname: `/chats`, state: {username, receiver}}}
                className="enter-room-button"
            >
                View Chats
            </Link>
        </div>
    );
};

export default Home;

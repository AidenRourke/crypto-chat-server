import React from "react";
import {Link} from "react-router-dom";

import "./Home.css";

const Home = () => {
    const [username, setUsername] = React.useState("");
    const [to, setTo] = React.useState("");


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
                value={to}
                onChange={event => setTo(event.target.value)}
                className="text-input-field"
            />
            <Link to={{pathname: `/${to}`, state: {username}}} className="enter-room-button">
                Begin Conversation
            </Link>
        </div>
    );
};

export default Home;
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from "../api";
import Post from "../components/Post"
import Comments from "../components/Comments"
import LogoutButton from "../components/LogoutButton";
import { Button } from "react-bootstrap";
import "../styles/Button.css"
import "../styles/Details.css"

function Details() {
    const location = useLocation();
    const state = location.state;
    const navigate = useNavigate();
    const [guestToken, setGuestToken] = useState('');

    useEffect(() => {
        setGuestToken(state.data.guest_token); // Store guest token in separate state so that it can be refreshed and updated
    }, []);

    const refreshGuestToken = () => { // Refresh guest token to remove access for any previously shared links
        api.patch(`/posts/${state.data.id}/refresh_guest_token/`)
            .then((res) => res.data)
            .then((data) => setGuestToken(data.guest_token)) // Set the new token after refreshing
            .catch((err) => console.log(err));
    };

    return (<div>
        <div className="button-container">
            <Button variant="dark" size="sm" onClick={() => navigate(-1)} className="back-button">Back</Button>
            <Link to={`/guestDetails/${state.data.id}/${guestToken}`}>Share Link (right click to copy)</Link>
            <Button variant="warning" size="sm" onClick={() => refreshGuestToken()}>Refresh Share Link</Button>
            <LogoutButton/>
        </div>
        <div className="post-comments-container">
            <div className="post-container">
                <Post post={ state.data }></Post>
            </div>
            <div className="comments-container">
                <Comments post={ state.data } isGuest={ false }></Comments>
            </div>
        </div>
    </div>);
}

export default Details;
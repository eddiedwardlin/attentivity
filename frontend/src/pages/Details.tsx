import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from "../api";
import Post from "../components/Post"
import Comments from "../components/Comments"
import LogoutButton from "../components/LogoutButton";
import Button from 'react-bootstrap/Button';
import "../styles/Button.css"
import "../styles/Details.css"
import Toast from 'react-bootstrap/Toast';
import Footer from "../components/Footer";
import Modal from 'react-bootstrap/Modal';

function Details() {
    const location = useLocation();
    const state = location.state;
    const navigate = useNavigate();
    const [guestToken, setGuestToken] = useState('');
    const [copyAlert, setCopyAlert] = useState(false);
    const [refreshAlert, setRefreshAlert] = useState(false);

    useEffect(() => {
        setGuestToken(state.data.guest_token); // Store guest token in separate state so that it can be refreshed and updated
    }, []);

    const refreshGuestToken = () => { // Refresh guest token to remove access for any previously shared links
        api.patch(`/posts/${state.data.id}/refresh_guest_token/`)
            .then((res) => res.data)
            .then((data) => {setGuestToken(data.guest_token); console.log(data)}) // Set the new token after refreshing
            .catch((err) => console.log(err));
    };

    const copyLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        setCopyAlert(true);
        e.preventDefault();
        navigator.clipboard.writeText(window.location.origin + path);
    };

    return <div>
        <div className="button-container">
            <Button variant="dark" size="sm" onClick={() => navigate(-1)} className="back-button">Back</Button>
            <Toast bg="secondary" onClose={() => setCopyAlert(false)} show={copyAlert} delay={1500} autohide className="copy-toast">
                <Toast.Body className="toast-text">Copied</Toast.Body>
            </Toast>
            <Link to={`/guestDetails/${state.data.id}/${guestToken}`} onClick={(e) => copyLink(e, `/guestDetails/${state.data.id}/${guestToken}`)}>Share This Feedback Link (click to copy)</Link>
            <Button variant="warning" size="sm" onClick={() => setRefreshAlert(true)}>Refresh Feedback Link</Button>
            <Modal show={refreshAlert} onHide={() => setRefreshAlert(false)}>
                <Modal.Header closeButton>
                <Modal.Title>WARNING</Modal.Title>
                </Modal.Header>
                <Modal.Body>Refreshing feedback link revokes access to previously shared links.</Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => setRefreshAlert(false)}>
                    Close
                </Button>
                <Button variant="danger" onClick={() => {refreshGuestToken(); setRefreshAlert(false)}}>
                    Confirm
                </Button>
                </Modal.Footer>
            </Modal>
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
        <Footer/>
    </div>;
}

export default Details;
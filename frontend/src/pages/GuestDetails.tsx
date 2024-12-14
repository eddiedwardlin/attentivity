import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import api from "../api";
import Post from "../components/Post"
import Comments from "../components/Comments"
import LogoutButton from "../components/LogoutButton";
import { Button } from "react-bootstrap";
import "../styles/Button.css"
import "../styles/Details.css"

function GuestDetails() {
    const params = useParams(); // From URL
    const [post, setPost] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => { // Get post as soon as page renders
        getPost();
    }, []);


    const getPost = async () => { // Get a post using guest token
        try {
            setLoading(true);
            const res = await api.get(`/posts/${params.postId}/`, {
                params: { guest_token: params.guestToken },
            });
            setPost(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) { // Prevent page from loading before post is received from api call
        return <div></div>;
    }

    return (<div>
        <div className="post-comments-container">
            <div className="post-container">
                <Post post={ post }></Post>
            </div>
            <div className="comments-container">
                <Comments post={ post } isGuest={ true }></Comments>
            </div>
        </div>
    </div>);
}

export default GuestDetails;
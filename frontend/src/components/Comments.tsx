import { useState, useEffect } from "react";
import api from "../api";
import Markdown from 'react-markdown'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import "../styles/Button.css"

interface User { // Custom type to store user info
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    posts: number[];
    is_staff: boolean;
};

interface Props {
    post: any;
    isGuest: boolean;
};

function Comments({post, isGuest}: Props) {
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("");
    const [summary, setSummary] = useState("");
    const [currUser, setCurrUser] = useState<User | null>(null);
    const [updated, setUpdated] = useState(true);
    const [loading, setLoading] = useState(false);
    const [guestName, setGuestName] = useState("Guest");

    useEffect(() => {
        getComments();
        if (!isGuest) {
            getUser();
            getSummary(); // Only used for setting the summary which the guest shouldn't see
        }
    }, []);

    const getUser = () => {
        api
            .get("/users/")
            .then((res) => res.data)
            .then((data) => { setCurrUser(data) })
            .catch((err) => console.log(err));
    };

    const getComments = () => { // Get comments for a post (uses guest token if not logged in)
        api
            .get(`/posts/${post.id}/comments/`, {
                params: { guest_token: post.guest_token },
            }).then((res) => res.data)
            .then((data) => { setComments(data) })
            .catch((err) => console.log(err));
    };

    const deleteComment = (id: number) => {
        api.delete(`/posts/${post.id}/comments/${id}/`, {
            params: { guest_token: post.guest_token },
        }).then((res) => {
            if (res.status === 204) {
                console.log("Comment deleted");
            } else {
                console.log("Failed to delete comment");
            }
            getComments();
            setUpdated(true); // Generate summary instead of retrieving since there's a change
        }).catch((err) => console.log(err));
    };

    const createComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        api.post(`/posts/${post.id}/comments/`, {body: newComment, guest_name: guestName}, {
            params: { guest_token: post.guest_token },
        }).then((res) => {
            if (res.status === 201) {
                console.log("Comment created");
            } else {
                console.log("Failed to create comment");
            }
            getComments();
            setUpdated(true); // Generate summary instead of retrieving since there's a change
        }).catch((err) => console.log(err));
    };

    // const summarizeComments = () => {
    //     setLoading(true);
    //     const commentsSerialized = comments.map(comment => encodeURIComponent(comment.body)).join('|');
    //     api.get(`/posts/${post.id}/summary/`, {
    //         params: { comments: commentsSerialized },
    //     }).then((res) => res.data)
    //     .then((data) => { 
    //         setSummary(data.summary)
    //         setUpdated(false)
    //     })
    //     .catch((err) => alert(err))
    //     .finally(() => setLoading(false));
    // };

    const summarizeComments = async () => {
        try {
            setLoading(true);
            const commentsSerialized = comments.length === 0 ? "" : comments.map(comment => encodeURIComponent(comment.body)).join('|'); // Pass comments in separated by pipe
            const res = await api.get(`/posts/${post.id}/summary/`, {
                params: { comments: commentsSerialized },
            });
            setSummary(res.data.summary);
            setUpdated(false); // Retrieve summary next time instead of generating to save api call
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const getSummary = () => {
        api
            .get(`/posts/${post.id}/`)
            .then((res) => res.data)
            .then((data) => { setSummary(data.summary) })
            .catch((err) => console.log(err));
    };
    
    // return <div>

    //     <h2>Add a Comment</h2>
    //     <form onSubmit={createComment}>
    //         <label htmlFor="content">New comment:</label>
    //         <br />
    //         <textarea
    //             id="content"
    //             name="content"
    //             required
    //             value={newComment}
    //             onChange={(e) => setNewComment(e.target.value)}
    //         ></textarea>
    //         <input type="submit" value="Submit"></input>
    //     </form>
        
    //     <h3>Comments</h3>
    //     {comments.map((comment) => (
    //         <li key={comment.id}>
    //             "{comment.body}" by {comment.author}
    //             {(comment.author === currUser?.email || currUser?.is_staff) && (
    //                 <button className="delete-button" onClick={() => deleteComment(comment.id)}>
    //                             Delete
    //                 </button>
    //             )}
    //         </li>
    //     ))}
    //     <button className="summary-button" onClick={() => {if (updated) summarizeComments()}}>Summarize</button>
    //     <Markdown>{summary}</Markdown>
    // </div>

    return <div>
        {isGuest && (
            <Form onSubmit={(e) => {
                    e.preventDefault();
                    createComment(e);
                    setNewComment('');
                }} 
                className="form-container-wide">
                <h4>Add a Comment</h4>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter your name (defaults to Guest)" onChange={(e) => setGuestName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formComment">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control as="textarea" rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        )}
        
        {/* <h3>Comments</h3>
        {comments.map((comment) => (
            <li key={comment.id}>
                {!!comment.author ? (
                    <span><b>{comment.author}:</b> {comment.body} </span>
                ) : <span><b>Guest:</b> {comment.body}</span>}
                {(!comment.author || currUser) && (
                    <Button variant="danger" className="delete-button" onClick={() => deleteComment(comment.id)}>
                                X
                    </Button>
                )}
            </li>
        ))} */}

        <h4>Comments:</h4>
        {comments.length === 0 && <p className="center-p">No comments</p>}
        <ListGroup variant="flush">
            {comments.map((comment) => (
                <ListGroup.Item key={comment.id} className="list-group-item-no-background">
                    {(!comment.author || currUser) && (
                        // <Button variant="outline-danger" size="sm" className="delete-button rounded-circle" onClick={() => deleteComment(comment.id)}>
                        //     X
                        // </Button>
                        <CloseButton variant="white" onClick={() => deleteComment(comment.id)} className="delete-button"/>
                    )}
                    {!!comment.author ? (
                        <span className="list-span"><b>{comment.author}:</b> {comment.body} </span>
                    ) : <span className="list-span"><b>{comment.guest_name}:</b> {comment.body}</span>}
                </ListGroup.Item>
            ))}
        </ListGroup>

        {!isGuest && (
            <div className="button-container">
                <Button disabled={!updated} variant="info" size="lg" className="summary-button" onClick={() => {
                        getSummary();
                        if (summary === null || updated) {
                            summarizeComments();
                        }
                    }}>Summarize {loading && <Spinner animation="border" variant="light" size="sm" className="loading-indicator" />}
                </Button>
            </div>
        )}
            
        {!isGuest && <Markdown>{summary}</Markdown>}
        
    </div>
}

export default Comments
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import LogoutButton from "../components/LogoutButton";
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Footer from "../components/Footer";
import "../styles/Home.css"

function Home() {
    const [posts, setPosts] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [postSort, setPostSort] = useState("title");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getPosts(); // Get posts as soon as page renders
    }, []);

    const getPosts = () => { // Get all posts associated with user (all posts if staff)
        api
            .get("/posts/")
            .then((res) => res.data)
            .then((data) => { setPosts(data), console.log(data) })
            .catch((err) => console.log(err));
    };

    const deletePost = (id: number) => { // Delete a post
        api.delete(`/posts/${id}/`).then((res) => {
            if (res.status === 204) {
                console.log("Post deleted");
            } else {
                console.log("Failed to delete post");
            }
            getPosts();
        }).catch((err) => console.log(err));
    }

    const createPost = async (e: React.FormEvent<HTMLFormElement>) => { // Create a post using data from form
        e.preventDefault();

        try {
            setLoading(true);
            const res = await api.post("/posts/", { 
                title: title, 
                body: content, 
                image: image, 
                file: file 
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 201) {
                console.log("Post created");
            } else {
                console.log("Failed to create post");
            }
            getPosts();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const sortedPosts = posts.slice().sort((a, b) => {
        if (postSort === "title") return a.title.localeCompare(b.title);
        return 0; // default is date added
    });

    return <div>
        <div className="button-container">
            <LogoutButton/>
        </div>
        <div className="form-posts-container">
            <div className="posts-container">
                <div className="header-container">
                    <h1>Posts</h1>
                    <DropdownButton id="dropdown-basic-button" title="Sort by" size="sm" variant="secondary" data-bs-theme="dark" align="end" onSelect={(e) => setPostSort(e ?? 'date')}>
                        <Dropdown.Item eventKey="date" active={postSort === 'date'}>Date added</Dropdown.Item>
                        <Dropdown.Item eventKey="title" active={postSort === 'title'}>Title</Dropdown.Item>
                    </DropdownButton>
                </div>
                {posts.length === 0 && <p className="center-p">No posts</p>}
                <ListGroup variant="flush">
                    {sortedPosts.map((post) => (  
                            <ListGroup.Item key={post.id} className="list-group-item">
                                <CloseButton variant="white" onClick={() => deletePost(post.id)} className="delete-button"/>
                                <Link to="/details" state={{data: post}} className="link-item"><b>{post.title}:</b> {post.body.slice(0, 50)}{post.body.length > 50 && '...'}</Link>
                            </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
            <div className="home-form-container">
                <Form onSubmit={(e) => {
                        e.preventDefault();
                        createPost(e);
                        setTitle("");
                        setContent("");
                        const imageInput = document.getElementById('formImage') as HTMLInputElement;
                        const fileInput = document.getElementById('formFile') as HTMLInputElement;

                        if (imageInput) imageInput.value = '';
                        if (fileInput) fileInput.value = '';
                    }} 
                    className="form-container-wide">
                    <h3>Create a Post</h3>
                    <Form.Group className="mb-3" controlId="formTitle">
                        <Form.Label>Title *</Form.Label>
                        <Form.Control type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control as="textarea" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formImage" className="mb-3">
                        <Form.Label>Image (max size: 100MB)</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                            onChange={(e) => {
                                const fileInput = e.target as HTMLInputElement;
                                if (fileInput.files && fileInput.files[0]) {
                                    setImage(fileInput.files[0]);
                                    setFile(null);
                                    const fileVal = document.getElementById('formFile') as HTMLInputElement;
                                    if (fileVal) fileVal.value = '';
                                } else {
                                    setImage(null);
                                }
                            }}
                        />
                    </Form.Group>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>or Text/Video File (max size: 1GB)</Form.Label>
                        <Form.Control
                            type="file"
                            accept="application/pdf, text/plain, text/rtf, video/mp4, video/mov"
                            onChange={(e) => {
                                const fileInput = e.target as HTMLInputElement;
                                if (fileInput.files && fileInput.files[0]) {
                                    setFile(fileInput.files[0]);
                                    setImage(null);
                                    const imageVal = document.getElementById('formImage') as HTMLInputElement;
                                    if (imageVal) imageVal.value = '';
                                } else {
                                    setFile(null);
                                }
                            }}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={loading || !title.trim() || !content.trim()}>
                        {loading ? 'Loading…' : 'Submit'}
                    </Button>
                </Form>
            </div>
        </div>
        <Footer/>
    </div>;
}

export default Home;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AxiosError } from 'axios';
import LogoutButton from "../components/LogoutButton";
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Accordion from 'react-bootstrap/Accordion';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Footer from "../components/Footer";
import "../styles/Home.css"

function Home() {
    const [posts, setPosts] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [projectTitle, setProjectTitle] = useState("")
    const [projectSort, setProjectSort] = useState("title");
    const [projectLoading, setProjectLoading] = useState(false);
    const [project, setProject] = useState("")
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [postLoading, setPostLoading] = useState(false);

    useEffect(() => {
        getPosts(); // Get posts as soon as page renders
        getProjects();  // Get projects as soon as page renders
    }, []);

    const getProjects = () => { // Get all projects associated with user (get all projects if staff)
        api
            .get("/posts/projects/")
            .then((res) => res.data)
            .then((data) => { setProjects(data), console.log(data) })
            .catch((err) => {console.log(err)});
    }
    const deleteProject = (id: number) => { // Delete a project
        api.delete(`/posts/projects/${id}/`).then((res) => {
            if (res.status === 204) {
                console.log("Project deleted");
            } else {
                console.log("Failed to delete project");
            }
            getProjects();
        }).catch((err) => console.log(err));
    }

    const createProject = async (e: React.FormEvent<HTMLFormElement>) => { // Create a project using data from form
        e.preventDefault();

        try {
            setProjectLoading(true);
            const res = await api.post("/posts/projects/", { 
                title: projectTitle, 
            });

            if (res.status === 201) {
                console.log("Project created");
            } else {
                console.log("Failed to create project");
            }
            getProjects();
        } catch (err) {
            if (err instanceof AxiosError) {
                alert(err.response?.data?.title); // No duplicate titles
            }
            console.log(err);
        } finally {
            setProjectLoading(false);
        }
    }

    const getPosts = () => { // Get all posts associated with user (get all posts if staff)
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
            getProjects();
            getPosts();
        }).catch((err) => console.log(err));
    }

    const createPost = async (e: React.FormEvent<HTMLFormElement>) => { // Create a post using data from form
        e.preventDefault();

        try {
            setPostLoading(true);
            const res = await api.post("/posts/", { 
                project: project,
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
            getProjects();
            getPosts();
        } catch (err) {
            if (err instanceof AxiosError) {
                alert(err.response?.data?.title); // No duplicate titles
            }
            console.log(err);
        } finally {
            setPostLoading(false);
        }
    }

    const sortedProjects = projects.slice().sort((a,b) => {
        if (projectSort === "title") return a.title.localeCompare(b.title);
        return 0; // default is date added
    });

    return <div>
        <div className="button-container">
            <LogoutButton/>
        </div>
        <div className="form-posts-container">
            <div className="posts-container">
                <div className="header-container">
                    <h1>Projects</h1>
                    <DropdownButton id="dropdown-basic-button" title="Sort by" size="sm" variant="secondary" data-bs-theme="dark" align="end" onSelect={(e) => setProjectSort(e ?? 'date')}>
                        <Dropdown.Item eventKey="date" active={projectSort === 'date'}>Date added</Dropdown.Item>
                        <Dropdown.Item eventKey="title" active={projectSort === 'title'}>Title</Dropdown.Item>
                    </DropdownButton>
                </div>
                {projects.length === 0 && <p className="center-p">No projects</p>}
                <Accordion flush alwaysOpen>
                    {sortedProjects.map((project) => (
                        <Accordion.Item eventKey={project.id.toString()} key={project.id}>
                            <div className="accordion-header-container">
                                <CloseButton variant="white" onClick={() => deleteProject(project.id)} className="delete-button"/>
                                <Accordion.Header className="accordion-header">
                                    {project.title}
                                </Accordion.Header>
                            </div>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {project.posts.length === 0 && <p className="center-p-small-margins">No posts</p>}
                                    {posts.map((post) => (
                                        project.posts.includes(post.id) && (
                                            <ListGroup.Item key={post.id} className="list-group-item-no-background-no-border">
                                                <CloseButton variant="white" onClick={() => deletePost(post.id)} className="delete-button"/>
                                                <Link to="/details" state={{data: post}} className="link-item"><b>{post.title}:</b> {post.body.slice(0, 50)}{post.body.length > 50 && '...'}</Link>
                                            </ListGroup.Item>
                                        )
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>
            <div className="home-form-container">
                <Form onSubmit={(e) => {
                        e.preventDefault();
                        createProject(e);
                        setProjectTitle('');
                    }} 
                    className="form-container-wide">
                    <h4>Create a Project</h4>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Title *</Form.Label>
                        <Form.Control type="text" placeholder="Enter title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={projectLoading || !projectTitle.trim()}>
                        {projectLoading ? 'Loading…' : 'Submit'}
                    </Button>
                </Form>
                <Form onSubmit={(e) => {
                        e.preventDefault();
                        createPost(e);
                        setProject("");
                        setTitle("");
                        setContent("");
                        const imageInput = document.getElementById('formImage') as HTMLInputElement;
                        const fileInput = document.getElementById('formFile') as HTMLInputElement;

                        if (imageInput) imageInput.value = '';
                        if (fileInput) fileInput.value = '';
                    }} 
                    className="form-container-wide">
                    <h4>Create a Post</h4>
                    <Form.Group className="mb-3" controlId="formProject">
                    <Form.Label>Project *</Form.Label>
                        <Form.Select value={project} onChange={(e) => setProject(e.target.value)}>
                            <option value="">Select a Project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.title}>
                                    {project.title}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
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
                    <Button variant="primary" type="submit" disabled={postLoading || !title.trim() || !content.trim() || !project.trim()}>
                        {postLoading ? 'Loading…' : 'Submit'}
                    </Button>
                </Form>
            </div>
        </div>
        <Footer/>
    </div>;
}

export default Home;
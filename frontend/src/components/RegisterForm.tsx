import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../styles/Form.css";

interface Props {
    route: string;
};

function RegisterForm({route}: Props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // Function for registering a user
        e.preventDefault();

        try {
            const res = await api.post(route, { 
                first_name: firstName,
                last_name: lastName,
                email: email, 
                password: password, 
                confirm_password: confirmPassword
            });
            localStorage.setItem(ACCESS_TOKEN, res.data.tokens.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.tokens.refresh);
            navigate("/login");
        } catch (error: any) {
            const { status, data } = error.response;
            let errorMessages = "";

            if (status === 400) { // Format error messages before alerting
                for (let i = 0; i < data.password.length-1; i++) {
                    errorMessages += data.password[i] + '\n';
                }
                errorMessages += data.password[data.password.length-1]
                alert(errorMessages);
            }
        }
    };

    // return <form onSubmit={handleSubmit} className="form-container">
    //     <h1>Register</h1>
    //     <input
    //         className="form-input"
    //         type="text"
    //         value={firstName}
    //         onChange={(e) => setFirstName(e.target.value)}
    //         placeholder="First Name"
    //     />
    //     <input
    //         className="form-input"
    //         type="text"
    //         value={lastName}
    //         onChange={(e) => setLastName(e.target.value)}
    //         placeholder="Last Name"
    //     />
    //     <input
    //         className="form-input"
    //         type="email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //         placeholder="Email"
    //     />
    //     <input
    //         className="form-input"
    //         type="password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //         placeholder="Password"
    //     />
    //     <input
    //         className="form-input"
    //         type="password"
    //         value={confirmPassword}
    //         onChange={(e) => setConfirmPassword(e.target.value)}
    //         placeholder="Confirm Password"
    //     />
    //     <button className="form-button" type="submit">Register</button>
    // </form>;

    return <Form onSubmit={handleSubmit} className="form-container">
        <h2>Register</h2>
        <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" placeholder="Enter first name" onChange={(e) => setFirstName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" placeholder="Enter last name" onChange={(e) => setLastName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">
            Register
        </Button>
    </Form>;
};

export default RegisterForm;
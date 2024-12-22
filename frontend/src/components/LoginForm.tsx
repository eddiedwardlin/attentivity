import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../styles/Form.css";
import "../styles/Button.css"

interface Props {
    route: string;
};

function LoginForm({route}: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // Function for logging in
        e.preventDefault();

        try {
            const res = await api.post(route, { 
                email: email, 
                password: password 
            });
            localStorage.setItem(ACCESS_TOKEN, res.data.tokens.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.tokens.refresh);
            navigate("/");
        } catch (error: any) {
            const { status, data } = error.response;
            let errorMessages = "";

            if (status === 400) { // Format error messages before alerting
                for (let i = 0; i < data.non_field_errors.length-1; i++) {
                    errorMessages += data.non_field_errors[i] + '\n';
                }
                errorMessages += data.non_field_errors[data.non_field_errors.length-1]
                alert(errorMessages);
            }
        }
    };

    return <Form onSubmit={handleSubmit} className="form-container">
        <h2>Login</h2>
        <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address *</Form.Label>
            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password *</Form.Label>
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <div className="form-button-container">
            <Button variant="primary" type="submit">
                Login
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/register')}>
                Create Account
            </Button>
        </div>
    </Form>;
};

export default LoginForm;
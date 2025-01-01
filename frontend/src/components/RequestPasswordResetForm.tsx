import { useState } from "react";
import api from "../api";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "../styles/Form.css";

interface Props {
    route: string;
};

function RequestPasswordResetForm({route}: Props) {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // Function for requesting password reset link
        e.preventDefault();

        try {
            const res = await api.post(route, { 
                email: email
            });
            alert("Password reset mail sent");
        } catch (error: any) {
            console.log(error)
        }
    };

    return <Form onSubmit={handleSubmit} className="form-container">
        <h2>Enter Email</h2>
        <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address *</Form.Label>
            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">
            Submit
        </Button>
    </Form>;
};

export default RequestPasswordResetForm;
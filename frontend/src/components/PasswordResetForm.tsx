import { useState } from "react";
import api from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import "../styles/Form.css";

interface Props {
    route: string;
};

function PasswordResetForm({route}: Props) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [myAlert, setMyAlert] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token'); // Get token from URL

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // Function for registering a user
        e.preventDefault();

        try {
            if (password !== confirmPassword) {
                alert("Passwords do not match")
                return;
            }

            await api.post(route, { 
                password: password, 
                token: token
            });
            alert("Password successfully reset")
            navigate("/login");
        } catch (error: any) {
            const { status, data } = error.response;

            if (status == 400) {
                const parsed_errors = data.password.join('\n\n');
                setMyAlert(parsed_errors);
            }
        }
    };

    return <Form onSubmit={handleSubmit} className="form-container">
        <h2>Reset Password</h2>
        <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password *</Form.Label>
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Confirm Password *</Form.Label>
            <Form.Control type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>
        {myAlert != "" &&
            <Alert variant="danger">
                {myAlert}
            </Alert>
        }
        <Button variant="primary" type="submit">
            Reset
        </Button>
    </Form>;
};

export default PasswordResetForm;
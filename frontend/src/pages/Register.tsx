import RegisterForm from "../components/RegisterForm"
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import "../styles/Button.css"
import Footer from "../components/Footer";

function Register() {
    const navigate=useNavigate();

    return <>
        <div className="button-container">
            <Button variant="dark" size="sm" onClick={() => navigate(-1)} className="back-button">Back</Button>
        </div>
        <RegisterForm route="/users/register/" />
        <Footer/>
    </>;
}

export default Register;
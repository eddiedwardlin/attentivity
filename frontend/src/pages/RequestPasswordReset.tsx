import Footer from "../components/Footer";
import RequestPasswordResetForm from "../components/RequestPasswordResetForm";
import Button from 'react-bootstrap/Button';
import "../styles/Button.css"
import { useNavigate } from "react-router-dom";

function RequestPasswordReset() {
    const navigate=useNavigate();
    
    return <div>
        <div className="button-container">
            <Button variant="dark" size="sm" onClick={() => navigate(-1)} className="back-button">Back</Button>
        </div>
        <RequestPasswordResetForm route="/api/password_reset/" />
        <Footer/>
    </div>;
}

export default RequestPasswordReset;
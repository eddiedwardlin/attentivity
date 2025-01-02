import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import '../styles/Landing.css'

function Landing() {
    const navigate = useNavigate();

    return <div className="welcome-container">
        <h1>Welcome to attentivity</h1>
        <Button onClick={() => navigate("/login")}>Enter</Button>
    </div>
}

export default Landing;
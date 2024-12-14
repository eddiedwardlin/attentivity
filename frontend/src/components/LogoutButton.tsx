import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { REFRESH_TOKEN } from "../constants";
import { Button } from "react-bootstrap";
import "../styles/Button.css"


function LogoutButton() {
    const navigate = useNavigate();

    const logout = () => { // Make api call to blacklist tokens when logging out
        let refreshToken = localStorage.getItem(REFRESH_TOKEN);
        api.post("/users/logout/", {refresh: refreshToken}).then((res) => {
            if (res.status === 205) {
                alert("User logged out");
            }
            navigate('/logout');
        }).catch((err) => console.log(err));
    };
    
    return <div>
        <Button variant="secondary" size="sm" onClick={() => logout()}>Logout</Button>
    </div>
}

export default LogoutButton 
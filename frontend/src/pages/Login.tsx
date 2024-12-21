import Footer from "../components/Footer";
import LoginForm from "../components/LoginForm"


function Login() {
    return <div>
        <LoginForm route="/users/login/" />
        <Footer/>
    </div>;
}

export default Login;
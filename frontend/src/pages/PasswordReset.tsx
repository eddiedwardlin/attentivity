import Footer from "../components/Footer";
import PasswordResetForm from "../components/PasswordResetForm"

function PasswordReset() {
    return <div>
        <PasswordResetForm route="/api/password_reset/confirm/" />
        <Footer/>
    </div>;
}

export default PasswordReset;
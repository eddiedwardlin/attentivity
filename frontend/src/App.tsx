import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Details from "./pages/Details";
import NotFound from "./pages/NotFound";
import PasswordReset from "./pages/PasswordReset";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ProtectedRoute from "./components/ProtectedRoute"
import Landing from "./pages/Landing";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css'
import GuestDetails from "./pages/GuestDetails";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/details" 
          element={
            <ProtectedRoute>
              <Details />
            </ProtectedRoute>
          }
        />
        <Route path="/guestDetails/:postId/:guestToken" element={<GuestDetails />}/> {/* postId and guestTokens used in api calls so have to be passed in */}
        <Route path="/login" element={<Login />}/>
        <Route path="/logout" element={<Logout />}/>
        <Route path="/register" element={<RegisterAndLogout />}/>
        <Route path="/passwordReset" element={<PasswordReset />}/>
        <Route path="/requestPasswordReset" element={<RequestPasswordReset />}/>
        <Route path="/" element={<Landing />}/>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { useState } from "react";
import { signUpUser } from "../../api/authApi";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try { 
      const signUpData = {
        name : name,
        email : email,
        password : password
      };

      const response = await signUpUser(signUpData);

      if (response.success) {
        alert("User Created successful");

        // Redirect based on user role
        if (response.user.role === "admin") {
          navigate("/admin/dashboard");
        } 
        else if (response.user.role === "staff") {
          navigate("/staff/dashboard");
        } 
        else if (response.user.role === "user") {
          navigate("/user/dashboard");
        }
      } 
      else {
        alert(response.message);
      }

    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        alert(error.response.data.message);
      } 
      else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">S</div>

        <h1>Create account</h1>

        <p>Sign up for your Supportly account.</p>

        <form className="login-form" onSubmit={handleSignUp}>
          <label htmlFor="name">Name</label>
          <input 
            id="name" 
            type="text" 
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Sign up</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <small>Supportly</small>
      </section>
    </main>
  );
}

export default Signup;
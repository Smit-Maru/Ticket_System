import { useState } from "react";
import "./Login.css";
import { loginUser } from "../../api/authApi";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const loginData = {
        email: email,
        password: password,
      };

      const response = await loginUser(loginData);

      if (response.success) {
        const role = response.user.role.toLowerCase().trim();

        if (role === "admin" || role === "administrator") {
          navigate("/admin/dashboard");
        } else if (role === "staff" || role === "support staff") {
          navigate("/staff/dashboard");
        } else if (role === "user") {
          navigate("/user/dashboard");
        }
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">S</div>

        <h1>Welcome back</h1>

        <p>Sign in to your Supportly account.</p>

        <form className="login-form" onSubmit={handleLogin}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Sign in</button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </p>

        <small>Supportly</small>
      </section>
    </main>
  );
}

export default Login;

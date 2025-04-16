
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Swal from 'sweetalert2';
import '../Styles/Login.css'; // Import your CSS styles
import { API_URL,headername,keypoint } from '../utils/config';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading
    const requestData = { email, password }; // Prepare request data

    try {
      const response = await fetch(`${API_URL}/api/auth/auth_admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [headername]:keypoint
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false); // Stop loading
        // Store the token in localStorage (or sessionStorage)
        localStorage.setItem('authToken', data.token);  // Save token
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
        });
        navigate('/dashboard'); // Navigate to the dashboard or desired page
      } else {
        setLoading(false); // Stop loading on error
        setError(data.message || 'Login Failed');
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.message || 'An error occurred during login.',
        });
      }
    } catch (err) {
      setLoading(false); // Stop loading on error
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message,
      });
    }
  };

  return (
    <div className="login-page">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <p className="login-error">{error}</p>}
          <div className="input-field">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Enter your email</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Enter your password</label>
          </div>
          <div className="forget">
            {/* You can add a "Forget password?" link here */}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Log In'}
          </button>
          {loading && <p className="loading-text">Please wait...</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

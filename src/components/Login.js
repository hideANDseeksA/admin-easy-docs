import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import '../Styles/Login.css'; // Import your CSS styles

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false); // Stop loading
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome back!',
      });
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
    <div class="login-page">
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

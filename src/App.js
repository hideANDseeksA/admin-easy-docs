
import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import your auth instance
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut from firebase/auth
import Login from './components/Login';
import MainDashboard from './components/MainDashboard'; // Import your MainDashboard

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  return (
    <div>
      {user ? (
        <div>
          {/* Pass user and handleSignOut to MainDashboard */}
          <MainDashboard user={user} onSignOut={handleSignOut} />
        </div>
      ) : (
        <div>
          <Login />
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useEffect, useState } from "react";

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Force set login session data
    sessionStorage.setItem('username', 'dikshant.goel@wpp.com');
    sessionStorage.setItem('role', 'Developer');
    sessionStorage.setItem('isAuth', JSON.stringify('MOCK_JWT_TOKEN'));
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  return children;
}

export default PrivateRoute;

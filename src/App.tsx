import React, { useEffect, useState, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './Redux/store';
import AllRoutes from './Components/Routes/AllRoutes';
import Navbar from './Components/Routes/Navbar';
import Cookies from 'js-cookie';
import { getCapsulTimer } from './Redux/ProductReducer/action';
import { BrowserRouter } from 'react-router-dom';

const AppContent: React.FC = () => {
  const [timer, setTimer] = useState<number>(0);
  const intervalRef = useRef<any>(null);
  const inactivityTimeoutRef = useRef<any>(null);

  const startTimer = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetInactivityTimeout = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      stopTimer();
    }, 10000);
  };

  const handleUserActivity = () => {
    startTimer();
    resetInactivityTimeout();
  };

  useEffect(() => {
    // Session login screen bypass
    sessionStorage.setItem('username', 'dikshant.goel@wpp.com');
    sessionStorage.setItem('role', 'Developer');
    sessionStorage.setItem('isAuth', JSON.stringify('MOCK_JWT_TOKEN'));

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    startTimer();
    resetInactivityTimeout();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearInterval(intervalRef.current);
      clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    Cookies.set('capsul', String(timer), { expires: 7 });
    store.dispatch(getCapsulTimer(timer));
  }, [timer]);

  return (
    <div className="AppContainer">
      <AllRoutes />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

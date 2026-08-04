import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }) => {
  const [testStatus, setTestStatus] = useState("");
  const [reportUrl, setReportUrl] = useState(`${process.env.REACT_APP_SERVER_URL}/cypress-report`);
  const [isLoading, setIsLoading] = useState(false);

  const runCypressTests = async () => {
    const userId = localStorage.getItem("userId");

    try {
      setIsLoading(true);

      const { data } = await axios.post(`${process.env.REACT_APP_SERVER_URL}/run-tests`);
      if (data) {
        setReportUrl(data);
      }

      const [testResponse, userIdResponse] = await axios.all([
        axios.post(`${process.env.REACT_APP_SERVER_URL}/run-tests`),
        axios.post(`${process.env.REACT_APP_SERVER_URL}/userId`, { userId }),
      ]);

      const testData = testResponse.data;
      const userIdData = userIdResponse.data;

      if (testData && userIdData) {
        // Do something with testData and userIdData if needed
      } else {
        console.error("No data received from one or both requests.");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("An error occurred:", error);
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ runCypressTests, testStatus, reportUrl, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

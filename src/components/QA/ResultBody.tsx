import React from "react";
import Loading from "./Loading";
import { useAppContext } from "./ContextAPI/AppContext";
import Navbar from "../SavedTemplate/Navbar";

const CypressTestContent: React.FC = () => {
  const { isLoading, reportUrl } = useAppContext();
    
  return (
    <div className="qa-report-container">
      <Navbar />
      {isLoading ? (
        <Loading />
      ) : (
        <div className="report-iframe-wrapper">
          {reportUrl && (
            <iframe
              title="Test Report"
              src={reportUrl}
              style={{ width: "100%", height: "1000px", border: "none" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CypressTestContent;

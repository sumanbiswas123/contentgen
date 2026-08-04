import { useEffect } from "react";
import Mainbox from "../mainbox";
import DownloadIndex from "../DownloadHTML/downloadIndex";
import { useNavigate } from "react-router-dom";
import "./HomeRoute.css";

function HomeRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Tracker redirect disabled — TrackerId no longer mandatory
    // let TrackerId = JSON.parse(localStorage.getItem('TrackerId')) || null
    // let role = sessionStorage.getItem('role')
    // if (!TrackerId) {
    //   if (role == "Developer") navigate('/developer-dashboard')
    //   else if (role == "POC") navigate('/poc-dashboard')
    //   else if (role == "QA") navigate('/quality-dashboard')
    // }
  }, []);

  return (
    <div className="home-route-container">
      {/* Toolbar */}
      <DownloadIndex />
      {/* Three-panel workbench */}
      <Mainbox />
    </div>
  );
}

export default HomeRoute;

import React from 'react';
import "./Navbar.css";
import Hlogo from "../Body/image_assets/Hlogo.png";
import bell from "../Body/image_assets/bell.png";
import avatar from "../Body/image_assets/avatar.png";
import eeLogo from "../Body/image_assets/EELogo.png";

const Navbar: React.FC = () => {
  return (
    <div className='NavBarContainer'>
      {/* ── Top gradient brand bar ── */}
      <div id='upperNavbar'>
        {/* Left: Logo + Brand */}
        <div className='navbar-brand-group'>
          <div className='navbar-logo-wrap'>
            <img src={Hlogo} alt="Hogarth Logo" />
          </div>
          <span className='navbar-brand-name'>ContentGen</span>
          <span className='navbar-brand-badge'>Studio</span>
        </div>

        {/* Right: Actions */}
        <div className='navbar-actions-group'>
          <button className='navbar-icon-btn' title="Notifications">
            <img src={bell} alt="Notifications" />
          </button>
          <button className='navbar-icon-btn' title="Profile">
            <img src={avatar} alt="User Avatar" />
          </button>
          <div className='navbar-ee-logo'>
            <img src={eeLogo} alt="EmpowerEngine" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
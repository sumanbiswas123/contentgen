import React from "react";
import Logo from "./TG_logo.ico";

function TGLOGO() {
  return (
    <div style={{ height: "80px", width: "80px" }}>
      <a href="#">
        <img src={Logo} alt="TG Logo" style={{ height: "100%", width: "100%" }} />
      </a>
    </div>
  );
}

export default TGLOGO;

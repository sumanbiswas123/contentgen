import React, { useContext, useState } from "react";
import axios from "axios";
import { useAppContext } from "./ContextAPI/AppContext";
import { Link } from "react-router-dom";

function RunButton() {
  const { runCypressTests } = useAppContext();

  return (
    <>
      <Link to={"/test-result"}>
        <button
          className="run-test-btn"
          onClick={runCypressTests}
          style={{
            backgroundColor: "#f36633",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 12px",
            fontSize: "14px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          RUN TEST
        </button>
      </Link>
    </>
  );
}

export default RunButton;

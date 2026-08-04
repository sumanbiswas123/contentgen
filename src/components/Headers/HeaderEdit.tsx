import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import TextEditor from "../LayoutEditor/TextEditor";
import { getHeader } from '../../Redux/ProductReducer/action'


const HeaderEdit = ({ value }) => {
    const dispatch = useDispatch()

  // console.log(value, "see");
//   const [latestFooter, setLatestFooter] = useState(value);
//   console.log(latestFooter);


  const HandleCodeMode = (code,typeObj)=>{
  
  
  localStorage.setItem("header", code);
    dispatch(getHeader(code))

  }
// ----------------------------------------------------------------------

  return (
    <div style={{margin:"20px",padding:"10px",boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px"}}>
      <div
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ overflow: "hidden" }}
      ></div>
     
      {
        value && <span style={{margin:"20px"}}>
        <TextEditor
          prevCode={value}
          typeObj={{ type: "footer" }}
          onContentChange={HandleCodeMode}
        />
        </span>
      }
    </div>
  );
};

const mapStateToProps = (selector) => {
  return {
    value: selector.ProductReducer.Header, // Replace with your actual Redux state structure
  };
};

export default connect(mapStateToProps)(HeaderEdit);

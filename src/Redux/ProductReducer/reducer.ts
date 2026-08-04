// import * as types from "./actionType";

// const initialState = {
//   Header: localStorage.getItem("header") || "",
//   Template: "",
//   Footer: localStorage.getItem("footer") || "",
//   PreHeader: localStorage.getItem("preheader") || "",
//   Body: localStorage.getItem("body") || "",
//   SubjectLine: localStorage.getItem("subjectline") || "",
//   PMDate: localStorage.getItem("pmdate") || "",
//   BrandThemeColor: localStorage.getItem("brandthemecolor") || "",
//   singleProductDetails: [],
//   isLoading: false,
//   isError: false,
// };

// const reducer = (oldState = initialState, action) => {
//   const { type, payload } = action;
//   //  console.log(type, payload)

//   switch (type) {
//     case types.GET_TEMPLATE_SUCCESS:
//       return {
//         ...oldState,
//         Template: payload,
//       };
//     case types.GET_HEADER_SUCCESS:
//       return {
//         ...oldState,

//         Header: payload,
//       };
//     case types.GET_FOOTER_SUCCESS:
//       return {
//         ...oldState,

//         Footer: payload,
//       };
//     case types.GET_HERO_SUCCESS:
//       return {
//         ...oldState,

//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_PARA_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_HEAD_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_DIVIDER_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_SIGNATURE_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_SURVEY_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_CTA_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_REFERENCE_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_SPEAKERMODULE_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_PREHEADER_SUCCESS:
//       return {
//         ...oldState,
//         PreHeader: payload,
//       };
//     case types.GET_SUBJECTLINE_SUCCESS:
//       return {
//         ...oldState,
//         SubjectLine: payload,
//       };
//     case types.GET_PCI_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };

//     case types.GET_IPC_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_IP_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_CIMG_SUCCESS:
//       return {
//         ...oldState,
//         Body: oldState.Body + "\n" + payload + "\n",
//       };
//     case types.GET_PMNUMBER_SUCCESS:
//       return {
//         ...oldState,
//         PMDate: payload,
//       };
//     case types.GET_BRANDTHEME_SUCCESS:
//       return {
//         ...oldState,
//         BrandThemeColor: payload,
//       };
    
    

//     default:
//       return oldState;
//   }
// };

// export { reducer };

// // new approch to solve



// --------------------------------------------------------------newcode
import * as types from "./actionType";
import Cookies from 'js-cookie';

let css = `<style type="text/css">
/*Css Reset Start*/
body,
#body_style {
  width: 100% !important;
  background: #ffffff;
  font-family: Arial;
  color: #ffffff;
  line-height: 1;
}
.ExternalClass {
  width: 100%;
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass table,
.ExternalClass div {
  line-height: 100%;
}
body {
  -webkit-text-size-adjust: none;
  -ms-text-size-adjust: none;
  margin: 0 !important;
}
body,
img,
div,
p,
ul,
li,
span,
strong,
a {
  margin: 0;
  padding: 0;
}
table {
  border-spacing: 0;
}
table td,
table th {
  border-collapse: collapse;
}
div {
  margin: 0 !important;
  padding: 0 !important;
}
a {
  outline: none !important;
}
a[href^="tel"],
a[href^="sms"] {
  text-decoration: none;
  color: inherit !important;
}
img {
  display: block !important;
  border: none !important;
  outline: none !important;
  text-decoration: none;
}
table {
  border-collapse: collapse;
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
}
.appleLinks {
  color: inherit;
  text-decoration: none;
}
.appleLinks a {
  color: inherit;
  text-decoration: none;
}
@keyframes pulse-border {
  0% {
    border-width: 1px;
    border-color: rgba(0, 191, 255, 1);
  }
  50% {
    border-width: 2px;
    border-color: rgba(255, 0, 191, 1);
  }
  100% {
    border-width: 1px;
    border-color: rgba(0, 191, 255, 1);
  }
}

/*Css Reset End*/

/*media query Start*/
@media only screen and (max-width: 599px) {
  td[class="Wrapper"] table[class="Container"] {
    width: 100% !important;
  }
  td[class="Wrapper"] .hero_image img {
    width: 100% !important;
    height: auto !important;
  }
  .hideSpace {
    display: none !important;
  }
  .blockSpace {
    width: 100% !important;
    height: auto !important;
    display: block !important;
  }
  *[class="gmail-fix"] {
    display: none !important;
  }
  td[class="Wrapper"] .col-100 {
    width: 100% !important;
    height: auto !important;
    display: block !important;
    float: none !important;
  }
  td[class="Wrapper"] .col-50 {
    width: 50% !important;
    height: auto !important;
    float: none !important;
  }
  .brk_none br {
    display: none !important;
  }
  td[class="Wrapper"] .fragment_image img {
    width: 100% !important;
    height: auto !important;
  }
}

@media only screen and (max-width: 479px) {
  .setPadding {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
  .blockSpace1 {
    width: 100% !important;
    height: 20px !important;
    display: block !important;
  }
  td[class="Wrapper"] .col-50 {
    width: 100% !important;
    height: auto !important;
    display: block !important;
  }
  td[class="Wrapper"] .col-header {
    width: 100% !important;
    float: none !important;
    display: block !important;
  }
  table[class="dec_width"] {
    width: 280px !important;
  }
  img[class="rezize"] {
    width: 100% !important;
    height: auto !important;
  }
  .button_size {
    width: 100%;
  }
}
/*media query End*/
</style>`

const initialState = {
  Header: (localStorage.getItem("body") && JSON.parse(localStorage.getItem("body") || "[]").length > 0) ? (localStorage.getItem("header") || "") : "",
  Template: "",
  DummeyTemplate:"",
  Footer: (localStorage.getItem("body") && JSON.parse(localStorage.getItem("body") || "[]").length > 0) ? (localStorage.getItem("footer") || "") : "",
  PreHeader: localStorage.getItem("preheader") || "",
  Body: JSON.parse( localStorage.getItem("body")) || [],
  SubjectLine: localStorage.getItem("subjectline") || "",
  PMDate: localStorage.getItem("pmdate") || "",
  BrandThemeColor: localStorage.getItem("isTheme") || "",
  singleProductDetails: [],
  ModalsStatus:[],
  Images :JSON.parse( localStorage.getItem("mailImages")) || [],
  isLoading: false,
  isError: false,
  HeaderImages:JSON.parse(localStorage.getItem("mailHeaderImages")) || [],
  FooterImages:JSON.parse(localStorage.getItem("mailFooterImages")) || [],
  CursorPointer :localStorage.getItem('cursorPointer') ||  0,
  CapsulTimer : Number(Cookies.get('capsul')) || 0,
  CustomCss: JSON.parse(localStorage.getItem('CustomCss')) || css
  
};

const reducer = (oldState = initialState, action) => {
  const { type, payload } = action;
  //  console.log(type,"test",oldState,oldState.CursorPointer)
  // console.log(type,payload,new Date())
  switch (type) {
    case types.GET_TEMPLATE_SUCCESS:
      return {
        ...oldState,
        Template: payload,
      };
    case types.GET_DUMMEY_TEMPLATE_SUCCESS:
      return {
        ...oldState,
        DummeyTemplate:payload,
      }
    case types.GET_HEADER_SUCCESS:
      return {
        ...oldState,

        Header: payload,
      };
    case types.GET_FOOTER_SUCCESS:
      return {
        ...oldState,

        Footer: payload,
      };
    case types.GET_HERO_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
        CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_PARA_SUCCESS:
      console.log([...oldState.Body.slice(0, +oldState.CursorPointer+1)],"super",+oldState.CursorPointer+1)
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_HEAD_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_DIVIDER_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
      case types.GET_SPACING_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_SIGNATURE_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_SURVEY_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_CTA_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_REFERENCE_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_SPEAKERMODULE_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_PREHEADER_SUCCESS:
      return {
        ...oldState,
        PreHeader: payload,
      };
    case types.GET_SUBJECTLINE_SUCCESS:
      return {
        ...oldState,
        SubjectLine: payload,
      };
    case types.GET_PCI_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };

    case types.GET_IPC_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_IP_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_CIMG_SUCCESS:
      return {
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      };
    case types.GET_USERCODE_SUCCESS:
      return{
        ...oldState,
        Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
      }
    case types.GET_PMNUMBER_SUCCESS:
      return {  
        ...oldState,
        PMDate: payload,
      };
    case types.GET_BRANDTHEME_SUCCESS:
      return {
        ...oldState,
        BrandThemeColor: payload,
      };
    case types.GET_BODY_SUCCESS:
      return{
        ...oldState,
        Body:[...payload]
      }
    case types.GET_UPDATECIMGMODAL_SUCCESS:
      return{
        ...oldState,
        ModalsStatus:[...oldState.ModalsStatus,payload]
      }
      case types.GET_I2CTA_SUCCESS:
        return {
          ...oldState,
          Body: [
          ...oldState.Body.slice(0, +oldState.CursorPointer+1), 
          payload,                          
          ...oldState.Body.slice(+oldState.CursorPointer+1),    
        ],
       CursorPointer : oldState.Body.length === 0 ? 0: +oldState.CursorPointer + 1
        };
      case types.GET_IMAGES_SUCCESS:
        // console.log(...oldState,payload)
        return {
          ...oldState,
          Images:[...oldState.Images,...payload]
        }
      case types.GET_SERVERIMAGES_SUCCESS:
        return{
          ...oldState,
          Images:[...payload]
        }
      case types.GET_HEADERIMAGES_SUCCESS:
        return{
          ...oldState,
          HeaderImages:payload
        }
      case types.GET_FOOTERIMAGES_SUCCESS:
        return{
          ...oldState,
          FooterImages:payload
        }
      case types.GET_CURSOR_POINTER_SUCCESS:
        return{
          ...oldState,
          CursorPointer:payload
        }
      case types.GET_CAPSUL_TIMER_SUCCESS:
        return{
          ...oldState,
          CapsulTimer:payload
        }
      case types.GET_CUSTOM_CSS_SUCCESS:
      return{
        ...oldState,
        CustomCss:payload
      }
      
      
    
    default:
      return oldState;
  }
};

export { reducer };

// new approch to solve


import { GET_BODY_SUCCESS, GET_BRANDTHEME_SUCCESS, GET_CAPSUL_TIMER_SUCCESS, GET_CIMG_SUCCESS, GET_CURSOR_POINTER_SUCCESS, GET_CUSTOM_CSS_SUCCESS, GET_FOOTERIMAGES_SUCCESS, GET_HEADERIMAGES_SUCCESS, GET_I2CTA_SUCCESS, GET_IMAGES_SUCCESS, GET_IP_SUCCESS, GET_PCI_SUCCESS, GET_PMNUMBER_SUCCESS, GET_PREHEADER_SUCCESS, GET_SERVERIMAGES_SUCCESS, GET_UPDATECIMGMODAL_SUCCESS, GET_USERCODE_SUCCESS } from "./actionType";

const getHeader = (data) => {
  return {
    type: "GET_HEADER_SUCCESS",
    payload: data,
  };
};

const getFooter = (data) => {
  return {
    type: "GET_FOOTER_SUCCESS",
    payload: data,
  };
};

const getTemplate = (data) => {
  // console.log(data)

  return {
    type: "GET_TEMPLATE_SUCCESS",
    payload: data,
  };
};

const getDummeyTemplate = (data)=>{
  return {
    type:"GET_DUMMEY_TEMPLATE_SUCCESS",
    payload: data,
  }
}

const getHero = (data) => {
  return {
    type: "GET_HERO_SUCCESS",
    payload: data,
  };
};
const getPara = (data) => {
  return {
    type: "GET_PARA_SUCCESS",
    payload: data,
  };
};

const getHead = (data) => {
  return {
    type: "GET_HEAD_SUCCESS",
    payload: data,
  };
};

const getDivider = (data) => {
  return {
    type: "GET_DIVIDER_SUCCESS",
    payload: data,
  };
};

const  getSpacing= (data) => {
  return {
    type: "GET_SPACING_SUCCESS",
    payload: data,
  };
};

const getSignature = (data) => {
  return {
    type: "GET_SIGNATURE_SUCCESS",
    payload: data,
  };
};
const getSurvey = (data) => {
  return {
    type: "GET_SURVEY_SUCCESS",
    payload: data,
  };
};
const getCta = (data) => {
  return {
    type: "GET_CTA_SUCCESS",
    payload: data,
  };
};

const getReference = (data) => {
  return {
    type: "GET_REFERENCE_SUCCESS",
    payload: data,
  };
};

const getSpeakerModule = (data) => {
  return {
    type: "GET_SPEAKERMODULE_SUCCESS",
    payload: data,
  };
};
const getSubjectLine=(data)=>{
  return {
    type:"GET_SUBJECTLINE_SUCCESS",
    payload:data
  }
}
const getPreHeader=(data)=>{
  return {
    type:GET_PREHEADER_SUCCESS,
    payload:data
    
  }
}

const getPCI=(data)=>{
  return {
    type:GET_PCI_SUCCESS,
    payload : data
    
  }
}

const getIPC=(data)=>{
  return {
    type:GET_PCI_SUCCESS,
    payload : data
    
  }
}
const getBody=(data)=>{
  return {
    type:GET_BODY_SUCCESS,
    payload : data
    
  }
}
const getIP =(data)=>{
  return {
    type:GET_IP_SUCCESS,
    payload : data
    
  }
}
const getPM =(data)=>{
  return {
    type:GET_PMNUMBER_SUCCESS,
    payload : data
    
  }
}

const getBrandTheme =(data)=>{
  return {
    type:GET_BRANDTHEME_SUCCESS,
    payload : data
    
  }
}

const getCimg =(data)=>{
  return {
    type:GET_CIMG_SUCCESS,
    payload : data
    
  }
}
const getModalStatus =(data)=>{
  return {
    type:GET_UPDATECIMGMODAL_SUCCESS,
    payload : data
  }
}

const getI2cta = (data)=>{
  return{
    type: GET_I2CTA_SUCCESS,
    payload: data
  }
}

const getImages = (data) =>{
  return{
    type : GET_IMAGES_SUCCESS,
    payload:data
  }
}

const getServerImages = (data)=>{
  return {
    type:GET_SERVERIMAGES_SUCCESS,
    payload:data
  }
}

const getUserCode = (data) =>{
  return{
    type:GET_USERCODE_SUCCESS,
    payload:data
  }
}
const getHeaderImages = (data) =>{
  return{
    type:GET_HEADERIMAGES_SUCCESS,
    payload:data
  }
}
const getFooterImages = (data)=>{
  return{
    type:GET_FOOTERIMAGES_SUCCESS,
    payload:data
  }
}

const getCursorPointer = (data) =>{
  return{
    type:GET_CURSOR_POINTER_SUCCESS,
    payload:data
  }
}

const getCapsulTimer = (data) =>{
  return{
    type:GET_CAPSUL_TIMER_SUCCESS,
    payload:data
  }
}

const getCustomCss = (data) =>{
  return{
    type:GET_CUSTOM_CSS_SUCCESS,
    payload:data
  }
}


const updateAstDocument = (ast: any) => {
  return {
    type: UPDATE_AST_DOCUMENT,
    payload: ast
  };
};

const undoAst = () => ({ type: UNDO_AST });
const redoAst = () => ({ type: REDO_AST });

export {
  getHeader,
  getTemplate,
  getDummeyTemplate,
  getFooter,
  getHero,
  getPara,
  getHead,
  getDivider,
  getSignature,
  getSurvey,
  getCta,
  getReference,
  getSpeakerModule,
  getSubjectLine,
  getPCI,
  getPreHeader,
  getIPC,
  getBody,
  getIP,
  getPM,
  getBrandTheme,
  getCimg,
  getModalStatus,
  getI2cta,
  getImages,
  getServerImages,
  getSpacing,
  getUserCode,
  getHeaderImages,
  getFooterImages,
  getCursorPointer,
  getCapsulTimer,
  getCustomCss,
  updateAstDocument,
  undoAst,
  redoAst
};
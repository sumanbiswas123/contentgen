// set backes are common dont worry just edit email

import React, { useCallback, useEffect, useRef, useState } from "react";
import EditorReuse from "../EditorSkills/EditorReusable";
import { getBody, getCursorPointer, getModalStatus, getHeader, getFooter, getPreHeader, getPM } from "../../Redux/ProductReducer/action";
import { useDispatch, useSelector } from "react-redux";
import { useCanvasEngine } from "../../hooks/useCanvasEngine";
// import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
// import { AiFillBackward } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./UpdateEmail.css";
import CImage from "../Body/CImage";
import BuildModeInspector from "./BuildModeInspector";
import ImageReusable from "../EditorSkills/ImageReusable";
import Hero from "../Body/hero";
import Signature from "../Body/Signature";
import Survey from "../Body/Survey";
import CtaButton from "../Body/CtaButton";
import References_Footnotes from "../Body/References_Footnotes";
import SpeakerModule from "../Body/TwocolumnSpecial/SpeakerModule";
import TwocoloumsPCI from "../Body/TwocolumnSpecial/TwocoloumsPCI";
import TwoColoumsIPC from "../Body/TwocolumnSpecial/TwoColoumsIPC";
import IP from "../Body/TwocolumnSpecial/IP";
import Divider from "../Body/divider";
import ParagraphNew from "../Body/ParagraphNew";
import I2CTA from "../Body/TwocolumnSpecial/I2CTA";
import TextEditor from "./TextEditor";
import Spacing from "../Body/Spacing";
import FooterEdit from "../Footers/FooterEdit";
import HeaderEdit from "../Headers/HeaderEdit";
import SubjectLineFun from "../Body/PreHeader/SubjectLine";
import { PreHeaderFun } from "../Body/PreHeader/PreHeaderFun";
import ClaravineGen from "../Body/ClaravineGen";
import BrandColorsTable from "../Gsk_template/BrandColors";
import DocumentNumber from "../Body/DocumentNumber";
import BrandTheme from "../Body/BrandTheme";
import HeaderCustom from "../Body/LayoutOptions";
import Code from "../Body/Code";
import UploadComponent from "../ImageBucket/uploadComponent";
import CustomCss from "../Body/CustomCss";
import SaveTemplate from "../SavedTemplate/SaveTemplate";
import { showCanvasModal } from "../../utils/canvasModal";

// ---------------------------------------------------------------------------------------

const UpdateEmail = ({ selectedCategory, setSelectedCategory }: any) => {
  const { eraseCanvas, duplicateBlock, toggleBlockResponsiveness, body: safeBody } = useCanvasEngine();
  //let me take data from the local storage
  let LSBodyArray = JSON.parse(localStorage.getItem("body")) || [];

  const [data, setData] = useState(LSBodyArray)

  const [prevCodeValue, setPrevCodeValue] = useState<any>("");

  const [prevCodeHeroValue, setPrevCodeHeroValue] = useState<any>({});
  const [prevCodeParagraph, setPrevCodeParagraph] = useState("")
  

  const [isRerender, setRerender] = useState(false);
  // const [isModalEditorResuableStatus, setModalEditorResuableStatus] = useState(false);

  const [isModalStatusCimg, setModalStatusCimg] = useState(false);

  const [currentEditingIndex, setCurrentEditingIndex] = useState<any>("");

  const [updatedArrayLs, setUpdatedArrayLs] = useState<any>("");

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [items, setItems] = useState(() => {
    // Initialize items from local storage
    const LSBodyArray = JSON.parse(localStorage.getItem("body")) || [];
    return LSBodyArray;
  });


  const {Footer,Header , CursorPointer , Body}  = useSelector((selector: any) => selector.ProductReducer);
  const store = useSelector((selector: any) => selector.ProductReducer);
  const [cursor , setCursor] = useState(CursorPointer)
  const scrollRef = useRef(null);

  // useEffect(()=>{

  // },[Footer])




    // ---------------------------------------------------------------------------------------

    const scrollToBottom = () => {
      window.scrollTo(0, document.body.scrollHeight);
    };

  // ---------------------------------------------------------------------------------------

  const HandleEditBlock = (e, i) => {
    var type = e.type;
    var e = e.code;
    if (type == "Paragraph") {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;

      const tdElements = tempContainer.querySelectorAll("td");
      // console.log(tdElements)

      const tdTextContents = Array.from(tdElements).map((td) => {
        // console.log(td.innerHTML)
        setPrevCodeParagraph(td.innerHTML);
      });

      // setModalEditorResuableStatus((prev) => !prev);

      //testing code end
    } else if (type == "HeroImage") {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;
      const tdElements = tempContainer.querySelectorAll("td");
      const tdTextContents = Array.from(tdElements).map((td) => {
        // console.log(td.innerHTML);
        // -------------------------------------------------------------------------------------------------------

        // Create a temporary element to parse the HTML
        const tempElement = document.createElement("div");
        tempElement.innerHTML = td.innerHTML;

        // Get the img src
        const imgElement = tempElement.querySelector("img");
        const imgSrc = imgElement ? imgElement.getAttribute("src") : "";
        const imgSrcParts = imgSrc.split("/");

        // Get the last part, which is the filename
        const FinalImgsrc = imgSrcParts[imgSrcParts.length - 1];

        // Get the anchor tag href
        const anchorElement = tempElement.querySelector("a");
        const anchorHref = anchorElement
          ? anchorElement.getAttribute("href")
          : "";

        // Get the alt text of the image
        const imgAlt = imgElement ? imgElement.getAttribute("alt") : "";

        // console.log("Image Source:", FinalImgsrc);
//         console.log("Anchor Href:", anchorHref);
        // console.log("Alt Text:", imgAlt);
        let prevCode = {
          imgsrc: FinalImgsrc,
          ahref: anchorHref,
          imgAlt: imgAlt,
          stage: "Edit",
        };

        setPrevCodeHeroValue(prevCode);

        // ----------------------------------------------------------------------------------------------------------
      });
    }else if(type == "CImg"){
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;

      const tdElements = tempContainer.querySelectorAll("td");
      // console.log(tdElements)

      const tdTextContents = Array.from(tdElements).map((td) => {
        // console.log(td.innerHTML) // Create a temporary element to parse the HTML
        const tempElement = document.createElement("div");
        tempElement.innerHTML = td.innerHTML;
        const imgAlign = td.getAttribute("align")
        

        // Get the img src
        const imgElement = tempElement.querySelector("img");
        const imgSrc = imgElement ? imgElement.getAttribute("src") : "";
        const imgSrcParts = imgSrc.split("/");

        // Get the last part, which is the filename
        const FinalImgsrc = imgSrcParts[imgSrcParts.length - 1];

        // Get the anchor tag href
        const anchorElement = tempElement.querySelector("a");
        const anchorHref = anchorElement
          ? anchorElement.getAttribute("href")
          : "";

        // Get the alt text of the image
        const imgAlt = imgElement ? imgElement.getAttribute("alt") : "";
        const imgWidth = imgElement ? imgElement.getAttribute("width") : "";
       

        // console.log("Image Source:", FinalImgsrc);
        // console.log("Anchor Href:", anchorHref);
        // console.log("Alt Text:", imgAlt);
        // console.log("widthimg", imgWidth)
        let prevCode = {
          imgsrc: FinalImgsrc,
          ahref: anchorHref,
          imgAlt: imgAlt,
          imgWidth:imgWidth,
          imgAlign:imgAlign,
          stage: "Edit",
        };
        // console.log("first staring")
        setPrevCodeValue(prevCode);
        // console.log("second end")
      });

    }else if(type == "Divider"){
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;

      

      const tdElements = tempContainer.querySelectorAll("td");
      

      const tdTextContents = Array.from(tdElements).map((td) => {
        // console.log(td)
        const dividerHeight = td.getAttribute("height")
        const styles = td.getAttribute("style")
        const stylesArray = styles.split(";")
      let dividerBGcolor =  stylesArray[1].split(":")[1]
      // console.log(dividerBGcolor,"see")
      let prevCode = {
        dividerHeight: dividerHeight,
        dividerBGcolor: dividerBGcolor,
      
        stage: "Edit",
      }
      // console.log(prevCode)

        setPrevCodeValue(prevCode);
      });
    }else if(type == "Spacing"){
      
      // Define a regular expression to match the height attribute
        const heightRegex = /height="(\d+)"/;

        // Use the regular expression to extract the height value
        const match = e.match(heightRegex);

        // Check if a match was found and extract the height value
        const heightValue = match ? parseInt(match[1]) : null;
        setPrevCodeValue({SpacingHeight:heightValue})
    }
    else if(type == "Signature"){
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;

      const tdElements = tempContainer.querySelectorAll("td");
      // console.log(tdElements)

      const tdTextContents = Array.from(tdElements).map((td) => {
        // console.log(td)
        if(td.innerText == " {{userName}} "){
          let styles = td.getAttribute("style")
          let colorAttr = styles.split(";")[0]
          let color = colorAttr.split(":")[1]

          // console.log(color)
          let prevCode = {color:color}
          setPrevCodeValue(prevCode);
        }
        
      });

    }else if(type == "CtaButton"){
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;
      // console.log(e)
      // console.log(e.split("align")[1].split(" ")[0].split('"')[1] ,"see")
     
      const tdElements = tempContainer.querySelectorAll("td");
      // console.log(tdElements)

      const tdTextContents = Array.from(tdElements).map((td) => {
        // console.log(td)
        let ctaText = td.innerText
        let ctaBrandColor = td.getAttribute("bgcolor");
        let ctaAlign = e.split("align")[1].split(" ")[0].split('"')[1]
       
        let anchortag = td.innerHTML
        // console.log(anchortag)
        let tempC = document.createElement("div")
        tempC.innerHTML = anchortag;
        let ctaLink = tempC.querySelector("a").getAttribute("href")
        // console.log(ctaLink)
        let prevCode = {
          ctaAlign,
          ctaBrandColor,
          ctaLink,
          ctaText
        }
       
        setPrevCodeValue(prevCode)
        
      
        
      });

    }
    else if (type == "References") {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = e;

      const tdElements = tempContainer.querySelectorAll("td");
      let content = ""

      const tdTextContents = Array.from(tdElements).map((td) => {
        let allpoints = td.querySelectorAll("td")
      
        allpoints.forEach((td,i)=>{

          if(i%2 == 1){
            // console.log(td.innerHTML)
            let temp = td.innerHTML;
           
            content += temp + "\n"
           
          }
         
        })
        
      });
      // console.log(content,"see")
      let prevCode = {
        points: content
      }
      setPrevCodeValue(prevCode)

     
       
    }else if(type == "SpeakerModule"){
      //Extract data here  and add it to innitial stage; parsing it here
     
     
      // const tempContainer = document.createElement("div");
      // tempContainer.innerHTML = e;
      // const tdElements = tempContainer.querySelectorAll("td");
      // // console.log(tdElements)

      // const tdTextContents = Array.from(tdElements).map((td) => {
      //   console.log(td)
        
      // });

      // let prevCode = {
      //   stage : "Edit"
      // }
      // setPrevCodeValue(prevCode)
      
      // console.log("done")
    }
     else {
      // alert(type)
      // console.log("done")
    }

    setCurrentEditingIndex(i);
  };

  // ------------------------------------------------------------------------------------------

  const handleCimg = (imagePath,
    imgBackgroundLink,
    imgHeight,
    imgWidth,
    imgALT,
    isalign) => {
    // console.log(imagePath,
    //   imgBackgroundLink,
    //   imgHeight,
    //   imgWidth,
    //   imgALT,
    //   isalign)


      var imghtml = imgBackgroundLink? `<tr>
    <td align="left" valign="top" class="${imgWidth > 280?"hero_image":"no"}">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td style="font-size: 0%;padding: 0px 20px" class="setPadding" align="${isalign}" class="${imgWidth > 280?"hero_image":"no"}">
    <a target="_blank" style="color: #164194; text-decoration: none" href="${imgBackgroundLink}"><img src="${imagePath}" width="${imgWidth}" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    "></a>
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>` :  `<tr>
    <td align="left" valign="top" class="${imgWidth > 280?"hero_image":"no"}"}>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presen tation">
    <tbody><tr>
    <td style="font-size: 0%;padding:0px 20px" class="setPadding"  align="${isalign}" class="${imgWidth > 280?"hero_image":"no"}">
    <img src="${imagePath}" width="${imgWidth}" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    ">
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`


    let LSBodyArray = JSON.parse(localStorage.getItem("body"));
    let newLS = LSBodyArray.map((e, i) => {
      // console.log(i,currentEditingIndex)
      if (i === currentEditingIndex) {
        
        return {
          type: "CImg",
          code: imghtml,
        };
      } else {
        return e; // Return the original element for other indices
      }
    });
    localStorage.setItem("body", JSON.stringify(newLS));
    dispatch(getBody(newLS));
    setUpdatedArrayLs(newLS);
  };

  // ------------------------------------------------------------------------------------------

  const handleDelete = (e, currentEditingIndex) => {
    var e = e.code;
    // Parse the current array from local storage
    let LSBodyArray = JSON.parse(localStorage.getItem("body"));

    // Filter the array to exclude the element at the currentEditingIndex
    let newLS = LSBodyArray.filter(
      (element, index) => index !== currentEditingIndex
    );

    // console.log(newLS);

    // Update the local storage with the new array
    localStorage.setItem("body", JSON.stringify(newLS));
    
    

    // Dispatch the new array to your Redux store
    dispatch(getBody(newLS));

    // Set the updated array in your component's state if needed
    setUpdatedArrayLs(newLS);

    // Get the current cursor pointer from localStorage
    let currentCursorPointer = Number(localStorage.getItem('cursorPointer'));
    if(currentEditingIndex > currentCursorPointer){
      //dont do anything
    }else{
        // Ensure currentCursorPointer is valid and greater than 0 before decrementing
      let newCursorPointer = currentCursorPointer > 0 ? currentCursorPointer - 1 : 0;
      // alert(newCursorPointer)
      dispatch(getCursorPointer(newCursorPointer))
      // Update the cursor pointer in local storage
      localStorage.setItem('cursorPointer', String(newCursorPointer));
    }
    
   

  };

  // -------------------------------------------------------------------------------------

  const HandleContentChange = (
    paraHtml, align, color, fontsize, bgcolor,bgfullcolor,sidep,topp
  ) => {
    
    let LSBodyArray = JSON.parse(localStorage.getItem("body"));
    let newLS = LSBodyArray.map((e, i) => {
      if (i === currentEditingIndex) {
        return {
          type: "Paragraph",
          code: `<tr>
          <td
            align="left"
            valign="top"
            style="padding: 0px ${sidep}px; background-color: ${bgfullcolor}"
            class="setPadding"
          >
            <table
              width="100%"
              border="0"
              cellspacing="0"
              cellpadding="0"
              role="presentation"
            >
              <tbody>
                <tr>
                  <td
                    align="${align}"
                    valign="top"
                    style="
                      color: ${color};
                      font-family: Arial;
                      font-size: ${fontsize}px;
                      line-height: ${+fontsize + 4}px;
                      background-color: ${bgcolor};
                      padding:${topp}px 0px;
                      mso-line-height-rule: exactly;
    
                    "
                    
                  >
                    ${paraHtml}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>`,
        };
      } else {
        return e; // Return the original element for other indices
      }
    });

    // Now, newLS contains the updated LSBodyArray with the replaced paragraph at currentEditingIndex.
    // --------------------------------------------------------------------------------------------------
  
    localStorage.setItem("body", JSON.stringify(newLS));
    dispatch(getBody(newLS));
    setUpdatedArrayLs(newLS);
  };

  // ---------------------------------------------------------------------------------------

  const HandleHeroImgProps = (imagePath, imgALT, imgBackgroundLink) => {
    // console.log(imagePath, imgALT, imgBackgroundLink);
   // const imagePath = process.env.PUBLIC_URL + `assets/${imagePath}`;
   

    setRerender((prev) => !prev);

    let LSBodyArray = JSON.parse(localStorage.getItem("body"));

    let newLS = LSBodyArray.map((e, i) => {
      if (i === currentEditingIndex) {
        return {
          type: "HeroImage",
          code: imgBackgroundLink
            ? `<tr>
    <td align="left" data-test="hero-image" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presen tation">
    <tbody><tr>
    <td class="hero_image" style="font-size: 0%">
    <a target="_blank" style="color: #164194; text-decoration: none" href="${imgBackgroundLink}"><img src="${imagePath}" width="600" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    "></a>
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`
            : `<tr>
    <td align="left" data-test="hero-image" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td class="hero_image" style="font-size: 0%">
    <img src="${imagePath}" width="600" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    ">
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`,
        };
      } else {
        return e; // Return the original element for other indices
      }
    });

    localStorage.setItem("body", JSON.stringify(newLS));
    dispatch(getBody(newLS));
    setUpdatedArrayLs(newLS);
  };

  // ---------------------------------------------------------------------------------------

  const HandleSignature = (SignHtml) => {
    // console.log(SignHtml)
    let LSBodyArray = JSON.parse(localStorage.getItem("body"));
    let newLS = LSBodyArray.map((e, i) => {
      console.log(i,currentEditingIndex)
      if (i === currentEditingIndex) {
        return {
          type: "Signature",
          code: SignHtml,
        };
      } else {
        return e; // Return the original element for other indices
      }
    });
    localStorage.setItem("body", JSON.stringify(newLS));
    dispatch(getBody(newLS));
    setUpdatedArrayLs(newLS);

  };
  
  // --------------------------------------------------------------------------------------

    const HandleSurvey = (goodName,goodLink,sufficientName,sufficientLink,inSufficientName,inSufficientLink) =>{

      console.log(goodName,goodLink,sufficientName,sufficientLink,inSufficientName,inSufficientLink)
      let LSBodyArray = JSON.parse(localStorage.getItem("body"));
      let newLS = LSBodyArray.map((e, i) => {
        console.log(i,currentEditingIndex)
        if (i === currentEditingIndex) {
          
          return {
            type: "Survey",
            code: `<tr>
            <td class="setPadding wrapper" data-test="survey-test" align="left" valign="top" bgcolor="#ffffff" style="padding-left:20px;padding-right:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
                <tbody>
                  <tr>
                    <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" style="color:#151515; font-family: Arial; font-size:14px; line-height:20px;" colspan="3"><strong>Did you like this e-mail?</strong></td>
                  </tr>
                  <tr>
                    <td width="33.3%" class="col-100" align="center" valign="top" bgcolor="#ffffff" style="padding-top: 20px;color:#10c777;font-size: 14px;font-weight: bold;"><a href="${goodLink}" target="_blank" style="color:#10c777;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/good.png" width="90" alt="Good" aria-hidden="true" style="display:block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"><br>
                      <span style="display: inline-block;text-decoration: underline;line-height: 20x;">${goodName}</span></a></td>
                    <td width="33.3%" class="col-100" align="center" valign="top" bgcolor="#ffffff" style="padding-top: 20px;color:#fe3f09;font-size: 14px;font-weight: bold;"><a href="${sufficientLink}" target="_blank" style="color:#fe3f09;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/sufficient.png" width="90" alt="Sufficient" aria-hidden="true" style="display:block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"><br>
                      <span style="display: inline-block;text-decoration: underline;line-height: 20x;">${sufficientName}</span></a></td>
                    <td width="33.3%" class="col-100" align="center" valign="top" bgcolor="#ffffff" style="padding-top: 20px;color:#f90c26;font-size: 14px;font-weight: bold;"><a href="${inSufficientLink}" target="_blank" style="color:#f90c26;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/insufficient.png" width="90" alt="Insufficient" aria-hidden="true" style="display:block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"><br>
                      <span style="display: inline-block;text-decoration: underline;line-height: 20x;">${inSufficientName}</span></a></td>
                  </tr>
                  <tr>
                    <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
                  </tr>
                </tbody>
              </table></td>
          </tr>`,
          };
        } else {
          return e; // Return the original element for other indices
        }
      });
      localStorage.setItem("body", JSON.stringify(newLS));
      dispatch(getBody(newLS));
      setUpdatedArrayLs(newLS);


    }


//------------------------------------------------------------------------------------

    const HandleCta =(ctaText,ctaLink,ctaBrandColor,ctaAlign)=>{
          console.log("first")
          let LSBodyArray = JSON.parse(localStorage.getItem("body"));
      let newLS = LSBodyArray.map((e, i) => {
        console.log(i,currentEditingIndex)
        if (i === currentEditingIndex) {
          
          return {
            type: "CtaButton",
            code: `<tr>
            <td align="${ctaAlign}" data-test="cta-test" class="setPadding" valign="top" style="padding:0px 15px;"><table width="auto" border="0" cellspacing="0" cellpadding="0">
            <tbody>
            <tr>
            <td align="center" valign="middle" width="auto" bgcolor="${ctaBrandColor}" style="color:#ffffff; font-family: arial; font-size: 16px; font-weight: bold;  line-height: 20px; padding: 10px 20px;"><a href="${ctaLink}" target="_blank" style="color:#ffffff;text-decoration:none;">${ctaText}</a></td>
            </tr>
            </tbody>
            </table></td>
            </tr>`,
          };
        } else {
          return e; // Return the original element for other indices
        }
      });
      localStorage.setItem("body", JSON.stringify(newLS));
      dispatch(getBody(newLS));
      setUpdatedArrayLs(newLS);
          
    }

//------------------------------------------------------------------------------------

    const HandleRef = (sample,selectedOption)=>{

      console.log(sample,selectedOption)
      let pointsAll = '';

      for (let i = 0; i < sample.length; i++) {
        sample[i] = sample[i].replace(/^<p>/, "").replace(/<\/p>$/, "");
        const pointEach =selectedOption ==="num"? `
          <tr>
            <td width="15" align="center" valign="top" style="
              font-family: Arial;
              font-size: 12px;
              font-weight: bold;
              color: #151515;
              line-height: 18px;
              text-align: left;
            ">${i + 1}.
            </td>
            <td align="center" valign="top" style="
              font-family: Arial;
              font-size: 12px;
              font-weight: normal;
              color: #151515;
              line-height: 18px;
              text-align: left;
            ">${sample[i]}
            </td>
          </tr>
        `:`<tr>
        <td width="15" align="center" valign="top" style="
          font-family: Arial;
          font-size: 12px;
          font-weight: bold;
          color: #151515;
          line-height: 18px;
          text-align: left;
        ">&bull;
        </td>
        <td align="center" valign="top" style="
          font-family: Arial;
          font-size: 12px;
          font-weight: normal;
          color: #151515;
          line-height: 18px;
          text-align: left;
        ">${sample[i]}
        </td>
      </tr>`;
  
        pointsAll += pointEach;
      }
  
      const RefHtml = `
      <tr>
      <td class="setPadding" align="center" valign="top" style="padding: 0px 20px" bgcolor="#f0efed">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
      <tbody>
      <tr>
      <td height="15" style="font-size: 1px">
      &nbsp;
      </td>
      </tr>
      <tr>
      <td align="center" valign="middle" style="
      font-family: Arial;
      font-size: 12px;
      font-weight: bold;
      color: #151515;
      line-height: 18px;
      text-align: left;
      ">
      References:
      </td>
      </tr>
      <tr>
      <td align="left" valign="top">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tbody>
      ${pointsAll}
      </tbody>
      </table>
      </td>
      </tr>
      
      <tr>
      <td align="center" valign="middle">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tbody>
      <tr>
      <td height="10" style="
      font-size: 1px;
      line-height: 1px;
      ">
      &nbsp;
      </td>
      </tr>
      <!--adverse events thailand default  -->
      
      <!--adverse events thailand default End -->
      </tbody>
      </table>
      </td>
      </tr>
      
      </tbody>
      </table>
      </td>
      </tr>
      `;

      let LSBodyArray = JSON.parse(localStorage.getItem("body"));
      let newLS = LSBodyArray.map((e, i) => {
        console.log(i,currentEditingIndex)
        if (i === currentEditingIndex) {
          
          return {
            type: "References",
            code: RefHtml,
          };
        } else {
          return e; // Return the original element for other indices
        }
      });
      localStorage.setItem("body", JSON.stringify(newLS));
      dispatch(getBody(newLS));
      setUpdatedArrayLs(newLS);
    }

//------------------------------------------------------------------------------------

const HandleSpeaker =(SpeakerHtml)=>{
  console.log(SpeakerHtml)
  let LSBodyArray = JSON.parse(localStorage.getItem("body"));
      let newLS = LSBodyArray.map((e, i) => {
        // console.log(i,currentEditingIndex)
        if (i === currentEditingIndex) {
          
          return {
            type: "SpeakerModule",
            code: SpeakerHtml,
          };
        } else {
          return e; // Return the original element for other indices
        }
      });
      localStorage.setItem("body", JSON.stringify(newLS));
      dispatch(getBody(newLS));
      setUpdatedArrayLs(newLS);
}

//------------------------------------------------------------------------------------

const HandlePCI =(PCIhtml)=>{
  // console.log(isChecked,PCIhtml)  
  let LSBodyArray = JSON.parse(localStorage.getItem("body"));
      let newLS = LSBodyArray.map((e, i) => {
        // console.log(i,currentEditingIndex)
        if (i === currentEditingIndex) {
          
          return {
            type: "PCI",
            code: PCIhtml,
          };
        } else {
          return e; // Return the original element for other indices
        }
      });
      localStorage.setItem("body", JSON.stringify(newLS));
      dispatch(getBody(newLS));
      setUpdatedArrayLs(newLS);
}

//------------------------------------------------------------------------------------


const HandleIPC = (componentHtml)=>{
  // console.log(componentHtml)

  let LSBodyArray = JSON.parse(localStorage.getItem("body"));
  let newLS = LSBodyArray.map((e, i) => {
    // console.log(i,currentEditingIndex)
    if (i === currentEditingIndex) {
      
      return {
        type: "IPC",
        code: componentHtml,
      };
    } else {
      return e; // Return the original element for other indices
    }
  });
  localStorage.setItem("body", JSON.stringify(newLS));
  dispatch(getBody(newLS));
  setUpdatedArrayLs(newLS);
}

//------------------------------------------------------------------------------------

const HandleIP =(IPhtml)=>{
  console.log(IPhtml)
  let LSBodyArray = JSON.parse(localStorage.getItem("body"));
  let newLS = LSBodyArray.map((e, i) => {
    // console.log(i,currentEditingIndex)
    if (i === currentEditingIndex) {
      
      return {
        type: "IP",
        code: IPhtml,
      };
    } else {
      return e; // Return the original element for other indices
    }
  });
  localStorage.setItem("body", JSON.stringify(newLS));
  dispatch(getBody(newLS));
  setUpdatedArrayLs(newLS);
}

//------------------------------------------------------------------------------------

const HandleDivider =(DividerCode)=>{
  let LSBodyArray = JSON.parse(localStorage.getItem("body"));
  let newLS = LSBodyArray.map((e, i) => {
    // console.log(i,currentEditingIndex)
    if (i === currentEditingIndex) {
      
      return {
        type: "Divider",
        code: DividerCode,
      };
    } else {
      return e; // Return the original element for other indices
    }
  });
  localStorage.setItem("body", JSON.stringify(newLS));
  dispatch(getBody(newLS));
  setUpdatedArrayLs(newLS);
}

//------------------------------------------------------------------------------------
const HandleSpacing = (SpacingCode)=>{
  let LSBodyArray = JSON.parse(localStorage.getItem("body"));
  let newLS = LSBodyArray.map((e, i) => {
    // console.log(i,currentEditingIndex)
    if (i === currentEditingIndex) {
      
      return {
        type: "Spacing",
        code: SpacingCode,
      };
    } else {
      return e; // Return the original element for other indices
    }
  });
  localStorage.setItem("body", JSON.stringify(newLS));
  dispatch(getBody(newLS));
  setUpdatedArrayLs(newLS);
}

  // --------------------------------------------------------------------------------------
  // const HandleUpdatedContent = ()=>{
  //     console.log(currentEditingIndex)
      
      
  //     let req = document.querySelector("#References").innerHTML
     
  //     console.log(req,"watch response")

  //     let LSBodyArray = JSON.parse(localStorage.getItem("body"));
  //     let newLS = LSBodyArray.map((e, i) => {
  //       console.log(i,currentEditingIndex)
  //       if (i === currentEditingIndex) {
  //         console.log(i,currentEditingIndex)
  //         return {
  //           type: "References",
  //           code: req,
  //         };
         
  //       } else {
  //         return e; // Return the original element for other indices
  //       }
  //     });
  //     console.log(newLS)
      
  //     localStorage.setItem("body", JSON.stringify(newLS));
  //     dispatch(getBody(newLS));
  //     setUpdatedArrayLs(newLS);
  //  }
  // --------------------------------------------------------------------------------------
  const HandleCodeMode = (code,typeObj)=>{
    console.log("updated code",code,typeObj)
    let LSBodyArray = JSON.parse(localStorage.getItem("body"));
  let newLS = LSBodyArray.map((e, i) => {
    // console.log(i,currentEditingIndex)
    if (i === typeObj.index) {
      return {
        type: typeObj.type,
        code: code,
      };
    } else {
      return e; // Return the original element for other indices
    }
  });
  localStorage.setItem("body", JSON.stringify(newLS));
  dispatch(getBody(newLS));
  setUpdatedArrayLs(newLS);
  }
// ----------------------------------------------------------------------

  const HandleGoHome = () => {
    navigate("/");
  };

  // --------------------------------------------------------------------------------------

  const handleDragEnd = (result) => {
    let items = JSON.parse(localStorage.getItem("body"));
    if (!result.destination) {
      return; // The item was dropped outside of a valid drop target
    }

    // Reorder the items array based on the drag-and-drop result
    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    localStorage.setItem("body", JSON.stringify(reorderedItems));

    // Dispatch the new array to your Redux store
    dispatch(getBody(reorderedItems));
    setItems(reorderedItems); // Update the state with the new item order

    // You can also persist the new order to your backend or local storage if needed
  };
  // console.log(items);
// --------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

  useEffect(() => {
    scrollToBottom()
  }, [updatedArrayLs, items, isRerender]);




  useEffect(() => {
    const updateCursorPointer = () => {
      localStorage.setItem('cursorPointer', CursorPointer);
    };

    updateCursorPointer();
  }, [Body]);


  useEffect(()=>{
    let cursorPointer = localStorage.getItem('cursorPointer') || 0;
    // console.log(cursorPointer)
    let components = document.querySelectorAll(".divCodeBlock")
    let heights = 0
    let flag = true;
    let lastDivHeight = 0;
    if( components && components.length>0){
      components.forEach((item,i)=>{
        // alert(i+" "+cursorPointer)
        if(flag == true){
         heights = heights +  item.clientHeight;
         lastDivHeight = item.clientHeight
       }
        if(i == +cursorPointer){
          flag = false
          // components[i].style.backgroundColor = 'red'
          item.classList.add('blinking-border')
        } else{
          item.classList.remove('blinking-border');
        }
      })
    }
    const scrollableDiv = document.querySelector('#editableDivsContainer');
    // console.log(scrollableDiv)
    // scrollableDiv.scrollTop = heights - lastDivHeight;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: heights, behavior: 'smooth' });
    }
    // scrollableDiv.scrollTo({
    //   top: heights - lastDivHeight,
    //   behavior: 'smooth' // Smooth scroll
    // });

  }, [ Body, CursorPointer])  




 



  const handleClick = useCallback((index) => {
    console.log("handleClick also")
    let a = document.querySelectorAll(".divCodeBlock");
    a.forEach((item, i) => {
      if (i === index) {
        item.classList.add('blinking-border');
        setCursor(i);
        localStorage.setItem("cursorPointer", String(i));
        dispatch(getCursorPointer(i));
      } else {
        item.classList.remove('blinking-border');
      }
    });
  }, [dispatch, setCursor]);
 



  // --------------------------------------------------------------------------------------

  const onOpenDeleteModal = () => {
    showCanvasModal({
      title: "Erase Canvas",
      message: "Are you sure you want to Start New Email? This will erase the current draft.",
      confirmLabel: "Yes, Erase",
      confirmVariant: "danger",
      onConfirm: () => {
        eraseCanvas();
      }
    });
  };

  return (
    <div className="right-panel-layer-stack Hidescroll" ref={scrollRef} id="editableDivsContainer" style={{ overflow: "hidden", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      {/* Property Inspector Header Bar with Erase Canvas & Save Template (Only visible when canvas has content) */}
      {Array.isArray(safeBody) && safeBody.length > 0 && (
        <div style={{
          padding: "12px 14px",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-darker)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}>
          <button
            onClick={onOpenDeleteModal}
            className="MenuButtons danger-btn"
            style={{ fontSize: "11px", padding: "0 10px", height: "30px" }}
          >
            🗑 Erase Canvas
          </button>

          <SaveTemplate 
            buttonClass="MenuButtons" 
            buttonStyle={{ fontSize: "11px", padding: "0 10px", height: "30px", background: "#f1f5f9", borderColor: "#cbd5e1" }} 
          />
        </div>
      )}

      {selectedCategory ? (
        <div className="Hidescroll" style={{ overflowY: "auto", padding: "12px 14px", flex: 1, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {(selectedCategory === 'Hero' || selectedCategory === 'HEROIMAGE') && <Hero stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {(selectedCategory === 'Paragraph' || selectedCategory === 'TEXT') && <BuildModeInspector category={selectedCategory} onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'Spacing' && <Spacing stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {(selectedCategory === 'CImage' || selectedCategory === 'CIMG') && <BuildModeInspector category={selectedCategory} onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'Divider' && <Divider stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {(selectedCategory === 'CtaButton' || selectedCategory === 'CTA') && <BuildModeInspector category={selectedCategory} onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'CustomCss' && <CustomCss stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'Code' && <Code stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {(selectedCategory === 'ClaravineGen' || selectedCategory === 'CLARAVINE') && <ClaravineGen stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'Signature' && <Signature stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'Survey' && <Survey stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'References_Footnotes' && <References_Footnotes stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'BrandColorsTable' && <BrandColorsTable stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {(selectedCategory === 'DocumentNumber' || selectedCategory === 'DOCUMENT') && <DocumentNumber stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'HeaderCustom' && <HeaderCustom stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'SubjectLineFun' && <SubjectLineFun stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'BrandTheme' && <BrandTheme stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'PreHeaderFun' && <PreHeaderFun stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
          {selectedCategory === 'UploadComponent' && <UploadComponent stage="SidebarEditor" onClose={() => setSelectedCategory(null)} />}
        </div>
      ) : (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎨</div>
          <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
            Click any element on the canvas to configure its properties here.
          </p>
        </div>
      )}
    </div>
  );
};

export default UpdateEmail;

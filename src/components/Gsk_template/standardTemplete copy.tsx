import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTemplate , getDummeyTemplate, getCursorPointer, getBody} from '../../Redux/ProductReducer/action'
import Preview from '../Preview/preview'
import axios from 'axios'
import TextEditor from '../LayoutEditor/TextEditor'

const StandardTemplete = () => {
    // const header = localStorage.getItem("HEADER") || null
    // console.log("see")
    const [items, setItems] = useState(JSON.parse(localStorage.getItem("body")) || []);
    const [isToggleEditor, setToggleEditor] = useState(false)
    const [prevCodeData , setPrevCodeData] = useState({
      index:null,
      prevCode:null,
      type:''
    })

    const dispatch = useDispatch()
    const { Header, Footer, Body ,SubjectLine,PreHeader,PMDate,Images, CustomCss} = useSelector((selector: any) => selector.ProductReducer);
    // console.log(CustomCss,"CustomCss")
    // console.log(Body)
    let dummy_fullBody = ''
    let fullBOdy = ""
    Body.forEach((e,i)=>{
      // console.log(e.type)
      //take current cursor and add it to
      fullBOdy  = fullBOdy + e.code;
      let cursor = localStorage.getItem("cursorPointer") || 0
      
      if(i == cursor){
        dummy_fullBody = dummy_fullBody +
        `<tr data-id="${i+1}">
        <td class="great" id="row${i}" onclick="getClassName(event)" style="border: 1px dashed blue; animation: pulse-border 30s infinite;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
       ${e.code}
        
        </tbody>
        </table></td>
        </tr>`

      }else{
        dummy_fullBody = dummy_fullBody + 
        `<tr data-id="${i+1}">
        <td id="row${i}" onclick="getClassName(event)" ><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
       ${e.code}
        
        </tbody>
        </table></td>
        </tr>`
      }

    })

    // let Barray = [...Body]
    
    // console.log(Header)
    const [header,setHeader] = useState("")
    const [ footer , setFooter] = useState("")
    const [ body, setBody] = useState("");
    const [contentEditable, setContentEditable] = useState("")

    const handleContentEditable = ()=>{
      contentEditable == "contentEditable"?setContentEditable(""):setContentEditable("contentEditable")
    }
   




    const handleIframeMessage = (event) => {
      console.log("count iframe")
      // Ensure that the message comes from your iframe
      if (event.origin !== window.location.origin) {
        return;
      }
      
      // Check if event.data is a string before using split
      if (event.data && event.data.type === 'customMessage') {
        if (event.data === 'reload') {
          window.location.reload();
        } else {
          let pointer = event.data.id.split('row')[1] || localStorage.getItem('cursorPointer') || 0;
          dispatch(getCursorPointer(pointer));
          localStorage.setItem('cursorPointer', pointer);
        }
      }else if (event.data.type === 'reorder') {
        console.log('🔄 Drag-and-drop reorder detected');
        console.log('Old index:', event.data.oldIndex);
        console.log('New index:', event.data.newIndex);
        // Optional: dispatch update here
        // dispatch(updateReorder({ oldIndex, newIndex }));
        // Same logic as your handleDragEnd function
        let items = JSON.parse(localStorage.getItem("body"));
        if (!items || !Array.isArray(items)) return;

        const reorderedItems = Array.from(items);
        const [movedItem] = reorderedItems.splice(event.data.oldIndex, 1);
        reorderedItems.splice(event.data.newIndex, 0, movedItem);

        // Update local storage and state
        localStorage.setItem("body", JSON.stringify(reorderedItems));
        dispatch(getBody(reorderedItems));
        setItems(reorderedItems); // Make sure setItems exists in your component
      }
      else if(event.data.type === 'doubleclick'){
        alert(event.data.index)
        setToggleEditor(false)
        let items = JSON.parse(localStorage.getItem("body"));
        if (!items || !Array.isArray(items)) return;
        const reorderedItems = Array.from(items);
        const [movedItem] = reorderedItems.splice(event.data.oldIndex, 1);
        console.log(movedItem,"............................................")




        setPrevCodeData((prev)=>({
          ...prev,
          index: event.data.index,
          prevCode: movedItem.code,
          type: movedItem.type

        }))
      }
      else {
        console.warn('Received non-string data:', event.data);
        // Handle non-string messages here if needed
      }
    };
    


    useEffect(() => {
      // Add event listener to listen for messages from iframe
      window.addEventListener('message', handleIframeMessage);
  
      // Clean up the event listener when component unmounts
      return () => {
        window.removeEventListener('message', handleIframeMessage);
      };
    }, []);



let dummy_std_temp = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN" id="Emailer">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>${SubjectLine}</title>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <!-- Add jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<!-- Add Sortable.js -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    ${CustomCss}
  </head>

  <body
    "  <!-- apply editable here -->
    style="
      font-family: Arial;
      font-size: 12px;
      font-weight: normal;
      color: #151515;
      background: #ffffff;
      margin: 0;
      padding: 0;
      width: 100% !important;
    "
    yahoo="fix"
  >
    <!--[if !mso 9]><!-->
    <div
      data-test="pre-header"
      style="
        display: none;
        font-size: 1px;
        color: #151515;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      ${PreHeader}
    </div>
    <!--<![endif]-->

    <table
      width="100%"
      bgcolor="#F5F5F5"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation"
    >
      <tbody>
        <tr>
          <td class="Wrapper" align="center" valign="top">
            <!-- Main Wrapper -->
            <table
              bgcolor="#ffffff"
              class="Container"
              width="600"
              border="0"
              cellspacing="0"
              cellpadding="0"
              align="center"
              role="presentation"
              id="sortable-root"
            >
              <tbody>
                <!-- Header -->
                <tr>

                <td>
                  <table>
  <tbody>
    ${header}
  </tbody>
</table>

<!-- Draggable body -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;" role="presentation">
  <tbody id="sortable-body" style="overflow: hidden; position: relative;">
    ${dummy_fullBody}
  </tbody>
</table>

<!-- Footer -->
<table>
  <tbody>
    ${footer}
    ${PMDate}
  </tbody>
</table>
                </td>

                </tr>


                <!-- Gmail App Fix -->
                <tr class="gmail-fix">
                  <td>
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="600"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#f8f6f5"
                            height="1"
                            style="line-height: 1px; min-width: 600px"
                          >
                            <img
                              src="assets/trans.png"
                              width="600"
                              height="1"
                              alt=""
                              style="
                                display: block;
                                max-height: 1px;
                                min-height: 1px;
                                min-width: 600px;
                                width: 600px;
                              "
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!-- Gmail App Fix End -->
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>

 
  

<script>
  $(document).ready(function () {
    // Right-click notification
    $(document).on("contextmenu", function () {
      window.parent.postMessage("reload", "*");
    });

    // Scroll to target if exists
    const $target = $(".great");
    if ($target.length) {
      $("html, body").animate(
        { scrollTop: $target.offset().top },
        500
      );
    }

    // Initialize Sortable only once
    const el = document.getElementById("sortable-body");
    if (el && !$(el).data("sortable-initialized")) {
      $(el).data("sortable-initialized", true);

      new Sortable(el, {
        animation: 150,
        direction: "vertical",
        ghostClass: "sortable-ghost",
        onEnd: function (evt) {
          // console.log("Reordered:", evt.oldIndex, "→", evt.newIndex);
          // Send old and new index to parent window
          window.parent.postMessage({
            type: 'reorder',
            oldIndex: evt.oldIndex,
            newIndex: evt.newIndex
          }, '*');
        }
      });


      // 🧠 Double-click handler only for sortable items (top-level blocks)
    const sortableItems = Array.from(el.children); // Direct children only (i.e., top-level blocks)
    sortableItems.forEach((item, index) => {
      item.addEventListener('dblclick', () => {
        window.parent.postMessage({
          type: 'doubleclick',
          index: index
        }, '*');
      });
    });

    }

    // Click handler
    window.getClassName = function (event) {
      const clickedElement = event.currentTarget;
      const id = {
        id: clickedElement.id,
        type: "customMessage"
      };
      window.parent.postMessage(id, "*");
    };
  });
</script>

</html>
`

    
    

let std_temp =  `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN" ${contentEditable} id="Emailer">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>${SubjectLine}</title>
    ${CustomCss}
  </head>
  <body
    style="
      font-family: Arial;
      font-size: 12px;
      font-weight: normal;
      color: #151515;
      background: #ffffff;
      margin: 0;
      padding: 0;
      width: 100% !important;
    "
    yahoo="fix"
  >
    <!--[if !mso 9]><!-->
    <div
    data-test="pre-header"
      style="
        display: none;
        font-size: 1px;
        color: #151515;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      ${PreHeader}
    </div>
    <!--<![endif]-->
    <table
      width="100%"
      bgcolor="#F5F5F5"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation"
    >
      <tbody>
        <tr>
          <td class="Wrapper" align="center" valign="top">
            <!-- Main Wrapper -->

            <table
              bgcolor="#ffffff"
              class="Container"
              width="600"
              border="0"
              cellspacing="0"
              cellpadding="0"
              align="center"
              role="presentation"
            >
              <tbody id="start">
                
              ${header}

              ${fullBOdy}
              
              
              ${footer}
              
              ${PMDate}

               

                <!-- Gmail App Fix -->
                <tr class="gmail-fix">
                  <td>
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="600"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#f8f6f5"
                            height="1"
                            style="line-height: 1px; min-width: 600px"
                          >
                            <img
                              src="assets/trans.png"
                              width="600"
                              height="1"
                              alt=""
                              style="
                                display: block;
                                max-height: 1px;
                                min-height: 1px;
                                min-width: 600px;
                                width: 600px;
                              "
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!-- Gmail App Fix End -->
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`


const HandleCodeMode = () =>{
}




useEffect(() => {
  // const userId=localStorage.getItem("userId")
  // const sendTemplate = async () => {
  //   try {
  //     let { data } = await axios.post(`${process.env.REACT_APP_SERVER_URL}/post-template`, {
  //       htmlTemplate: std_temp,
  //       userId:userId
  //     });

  //   } catch (e) {
  //     // console.log(e);
  //   }
  // };
 
  // sendTemplate();
}, [ Header,header,Footer, Body, SubjectLine, PreHeader, PMDate]);





useEffect(()=>{
  setHeader(Header)
  setFooter(Footer)
  setBody(Body.join("/n"))
  dispatch(getTemplate(std_temp))
  dispatch(getDummeyTemplate(dummy_std_temp))
  
},[Header,header,dispatch,Footer,Body,PMDate,std_temp,dummy_std_temp])
// console.log(body)
// console.log("nonsendse")
// console.log(header)
// console.log(Barray)
localStorage.setItem("body",JSON.stringify(Body))
localStorage.setItem("footer",footer)
localStorage.setItem("header",header)
localStorage.setItem("pmdate",PMDate)
localStorage.setItem("subjectline",SubjectLine)
localStorage.setItem("preheader",PreHeader)
localStorage.setItem("mailImages",JSON.stringify(Images))

console.log("count")



  return(
    <>
    <span ><TextEditor prevCode={prevCodeData.prevCode} typeObj={{type:prevCodeData.type,index:prevCodeData.index}}  onContentChange = {HandleCodeMode} state={isToggleEditor}/></span>

    <Preview data = {{finalCode:std_temp,handleContentEditable:handleContentEditable}} />
    </>
  ) 
}

export default StandardTemplete
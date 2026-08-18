import { getBody, getFooter, getHeader, getImages, getPM, getPreHeader, getServerImages, getSubjectLine } from "@/Redux/ProductReducer/action";
import { useState } from "react";
import { useDispatch } from "react-redux";


const PdfToHtml = () =>{
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState("2");
const [status, setStatus] = useState("");
const [result, setResult] = useState("");
const [isPdfToHtmlModal, setIsPdfToHtmlModal] = useState(false);
const dispatch = useDispatch()

const uploadPDF = async () => {
  if (!pdfFile) {
    alert("Please select a PDF file");
    return;
  }

  //lets pull username from localstorage and send to backend for review
  let userAndTask = localStorage.getItem("TrackerId") || "";
  

  const formData = new FormData();
  formData.append("pdf_file", pdfFile);
  formData.append("page_numbers", pages || "all");
  formData.append("userAndTask", JSON.stringify(userAndTask) || "")

  setStatus("Uploading and processing...");
  setResult("");

  try {
    const response = await fetch(`${import.meta.env.VITE_PDF_PY_SERVER}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server error");
    }



    
    const arr = await response.json()
    console.log(arr)
    // one most imp thing we need to consider here is arr now updgraded with both email and annotations
    // lets seprate and use them
    const annotations_key = arr.pop();
    // setAnnotations(annotations_key["annotation"]);  
    // lets put them in Ls and reuse in case of reaload
    // localStorage.setItem("annotations", JSON.stringify(annotations_key));
    // console.log(annotations,"annotations from server")
    

    // let LSBodyArray = JSON.parse(localStorage.getItem("body"));
    // console.log(arr,"array from server")
    // lets add these arr items to body array in LS

    // Assume you have an array of keys to delete
    var keysToDelete = [
      "footer",
      "mailImages",
      "header",
      "preheader",
      "pmdate",
      "subjectline",
      "mailHeaderImages",
      "mailFooterImages",
      "CustomCss",
    ];

    // Loop through the keys and delete the items from local storage
    for (var i = 0; i < keysToDelete.length; i++) {
      localStorage.removeItem(keysToDelete[i]);
    }
    dispatch(getBody(""));
    dispatch(getFooter(""));
    dispatch(getHeader(""));
    dispatch(getPM(""));
    dispatch(getSubjectLine(""));
    dispatch(getPreHeader(""));
    dispatch(getImages(""));
    dispatch(getServerImages(""));
    


    localStorage.setItem("body", JSON.stringify(arr));
    dispatch(getBody(arr));
    // lets use this array
    window.location.reload();
    

    setStatus("Done ✅");
  } catch (error) {
    console.error(error);
    setStatus("Error ❌: " + error.message);
  }
};



    return <div style={{position:'absolute',top:"10%",left:"10%"}}>
          {/* Your PDF → HTML popup goes here */}

          <h2>PDF to HTML</h2>

          <input type="file" accept=".pdf,application/pdf" onChange={(e) => setPdfFile(e.target.files[0])}/>

           <input
            type="text"
            placeholder="Pages (e.g. 1,2,5 or all)"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            style={{ width: "100%", padding: "6px" }}
        />

        {/* Status */}
                <div>{status}</div>


                <div
                  style={{ marginTop: "10px" }}
                  dangerouslySetInnerHTML={{ __html: result }}
                />

                <button
                  id="ThemeButtonSave"
                  onClick={uploadPDF}
                //   isLoading={status === "Uploading and processing..."?true:false}
                >
                  Convert
                </button>

          {/* <button onClick={() => setShowPdfModal(false)}>
            Close
          </button> */}



        


        </div>
}

export default PdfToHtml
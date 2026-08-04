import React, { useState } from "react";
import { rules } from "./QA_rules";

export function EmailValidatorComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessagesArray, setErrorMessagesArray] = useState<any[]>([]);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  async function runValidationAndOpenModal() {
    const errors = await EmailValidator();
    setErrorMessagesArray(errors || []);
    onOpen();
  }

  return (
    <>
      <button
        onClick={runValidationAndOpenModal}
        style={{
          padding: "8px 16px",
          border: "1px solid #319795",
          color: "#319795",
          background: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Validation HTML
      </button>

      {isOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "80%", maxWidth: "800px", maxHeight: "80vh", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Errors & Suggestions:</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ overflowY: "auto" as const, flex: 1, paddingRight: "10px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {errorMessagesArray?.map((e: any, index: number) =>
                  typeof e === "string" ? (
                    <li 
                      key={index}
                      style={{ padding: "8px", borderBottom: "1px solid #eee", transition: "background 0.2s" }}
                      onMouseEnter={(evt) => (evt.currentTarget.style.backgroundColor = "#ffd6c7")}
                      onMouseLeave={(evt) => (evt.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {e}
                    </li>
                  ) : (
                    <li 
                      key={index}
                      style={{ padding: "8px", borderBottom: "1px solid #eee", transition: "background 0.2s" }}
                      onMouseEnter={(evt) => (evt.currentTarget.style.backgroundColor = "#ffd6c7")}
                      onMouseLeave={(evt) => (evt.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <b>Img error:</b> {e.errorMessage}
                      <ul style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                        <li>
                          <b>Img Name:</b>{" "}
                          {
                            e.imgSrc.trim().split("/")[
                              e.imgSrc.trim().split("/").length - 1
                            ]
                          }
                        </li>
                      </ul>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" as const, borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
              <button 
                onClick={onClose}
                style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export async function EmailValidator() {
  const iframe = document.querySelector("iframe.previewbox");
  if (!iframe) {
    console.error("Iframe with class 'previewbox' not found.");
    return;
  }

  const iframeEl = iframe as HTMLIFrameElement;
  const iframeDocument =
    iframeEl.contentDocument || iframeEl.contentWindow!.document;
  if (!iframeDocument) {
    console.error("Unable to access the content of the iframe.");
    return;
  }

  let errorMessagesArray = [];

  const allImages = iframeDocument.querySelectorAll("img");
  const anchorTags = iframeDocument.querySelectorAll("a");

  // Check HTML file size
  checkHTMLFileSize();

  // Check hero images
  checkHeroImages();

  // Check inline styles for all images
  checkInlineStylesForImages();

  // Check header guidelines :-
  checkHeader();

  // Check some word should be italic

  checkWords();
  // Check all links
  await checkLinks();

  // Check if specified words are italicized

  // Display errors and suggestions

  function checkHTMLFileSize() {
    const html = iframeDocument.querySelector("html").outerHTML;
    const blob = new Blob([html], { type: "text/html" });
    const htmlSizeInBytes = blob.size;
    const htmlSizeInKB = Math.floor(htmlSizeInBytes / 1024);

    if (htmlSizeInKB < rules.htmlFileSize.maxKB) {
      errorMessagesArray.push("Your Html file size is passed");
    } else {
      errorMessagesArray.push(
        `Your Html file size is failed (file size should be ${rules.htmlFileSize.maxKB}kb)`
      );
    }
  }

  function checkHeroImages() {
    const heroImageTds = iframeDocument.querySelectorAll(
      "body td.hero_image img"
    );

    function checkCondition(img, condition, errorMessage) {
      if (!condition(img)) {
        return errorMessage;
      }
      return null;
    }

    Array.from(heroImageTds).reduce((messages, img) => {
      rules.heroImageRules.heroImageConditions.forEach((condition) => {
        const errorMessage = checkCondition(
          img,
          (img) => condition.check(img, rules.heroImageRules.allowedExtensions),
          condition.errorMessage
        );
        if (errorMessage) {
          errorMessagesArray.push({
            errorMessage: errorMessage,
            imgSrc: (img as HTMLImageElement).src,
          });
        }
      });

      return messages;
    }, []);
  }

  function checkInlineStylesForImages() {
    allImages.forEach((img) => {
      const inlineStyle = img.getAttribute("style");

      if (inlineStyle === null) {
        errorMessagesArray.push({
          errorMessage: "You should give inline style of this image",
          imgSrc: img.src,
        });
        return;
      }
      const imgSrc = img.getAttribute("src");
      if (!inlineStyle) {
        errorMessagesArray.push("Image missing inline style");
      } else {
        const styleAttributes = inlineStyle
          .toLowerCase()
          .split(";")
          .map((attr) => attr.trim());

        let errorMessageAdded = false;

        rules.inlineStylesForImages.requiredStyles.forEach((requiredStyle) => {
          if (!styleAttributes.includes(requiredStyle)) {
            if (!errorMessageAdded) {
              errorMessagesArray.push({
                errorMessage: `Image does not follow the required style ${requiredStyle}`,
                imgSrc,
              });
            }
            errorMessageAdded = true;
          }
        });
      }
    });
  }

  async function checkLinks() {
    const linkCheckerUrl = "http://localhost:8000/validate-link";
    let AllUrls = [];

    anchorTags.forEach((links) => {
      const href = links.getAttribute("href");
      const target = links.getAttribute("target");

      if (target !== "_blank") {
        if (href === "mailto:{{User.Email}}") {
        } else {
          errorMessagesArray.push({
            errorMessage: "This link will not open in new tab",
            imgSrc: href,
          });
        }
      }

      if (href && !href.startsWith("mailto:")) {
        AllUrls.push(href);
      }
    });

    // Function to validate multiple URLs
    async function validateLinks() {
      try {
        const response = await fetch(linkCheckerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: AllUrls }),
        });
        if (response.ok) {
          const results = await response.json();
          await results.map((notValid) => {
            errorMessagesArray.push(notValid);
          });
        } else {
          console.error("Error fetching data from server proxy.");
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    }

    await validateLinks();
  }

  function checkHeader() {
    let firstNestedTr =
      iframeDocument.querySelector(".pdng") ||
      iframeDocument.querySelector("table tr td table tr:first-child");
    let tdElementsWithinFirstNestedTr =
      firstNestedTr.querySelectorAll("td .container td");

    let paddingTr = firstNestedTr.querySelector("td");
    let getPadding = getComputedStyle(paddingTr).getPropertyValue("padding");

    if (getPadding !== "20px 20px 20px 30px") {
      errorMessagesArray.push(
        "You did not give right padding of your header 'td'"
      );
    }

    tdElementsWithinFirstNestedTr.forEach((td, index) => {
      if (td.getAttribute("class") !== "col-100") {
        errorMessagesArray.push("Your header is not responsive.");
      }

      if (
        index === tdElementsWithinFirstNestedTr.length - 1 &&
        (td as HTMLElement).innerText.length > 65
      ) {
        errorMessagesArray.push(
          "Your header exceeds the limit of 65 characters (including spaces)."
        );
      }

      if (index === tdElementsWithinFirstNestedTr.length - 1) {
        let getFontSize = getComputedStyle(td).getPropertyValue("font-size");
        let isAlignLeft = td.getAttribute("align") === "left";

        if (!isAlignLeft) {
          errorMessagesArray.push("Your header td should have align 'left'");
        }

        if (!["16px", "18px", "24px"].includes(getFontSize)) {
          errorMessagesArray.push(
            "Your header should have these font styles 16/18/24px"
          );
        }
      }
    });
  }

  function checkWords() {
    const checkWords = rules.wordsToCheckItalicized;

    function isItalicized(node) {
      return (
        node.tagName === "I" ||
        node.tagName === "EM" ||
        (node.style && node.style.fontStyle === "italic")
      );
    }

    function findTextNodes(element) {
      const walker = iframeDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes = [];
      let currentNode;

      while ((currentNode = walker.nextNode())) {
        textNodes.push(currentNode);
      }

      return textNodes;
    }

    function checkTextNode(textNode) {
      const parentNode = textNode.parentNode;
      const textContent = textNode.textContent;

      checkWords.forEach((word) => {
        const pattern = new RegExp(
          word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
          "gi"
        );
        let match;

        while ((match = pattern.exec(textContent)) !== null) {
          if (isItalicized(parentNode)) {
            //console.log(`Word: ${match[0]} is italicized.`);
          } else {
            errorMessagesArray.push(`Word: "${match[0]}" is not italicized.`);
          }
        }
      });
    }

    const textNodes = findTextNodes(iframeDocument.body);
    textNodes.forEach(checkTextNode);
  }

  //   function displayErrorsAndSuggestions() {
  //     let bgDiv = document.createElement("div");
  //     bgDiv.setAttribute("class", "modal-background");
  //     let head = document.querySelector("head>style");
  //     head.append(`ul li{
  //         border: 1px solid gray;
  //         text-align: left;
  //         border: none;
  //         cursor: pointer;
  //         transition: 500ms;
  //         font-family: Arial, Helvetica, sans-serif;
  //       }

  //       ul li:hover{
  //         transform: scale(1.0);
  //         background:  #ffd8ca;

  //       }
  //       ul::-webkit-scrollbar{
  //         display: none;
  //       }
  //       button{
  //         border: none;
  //         background: transparent;
  //         position: relative;
  //         left: 409px;
  //         top: -79px;
  //         font-size: 22px;
  //         color:#f36633;
  //         font-weight: 900;
  //         cursor: pointer;
  //       }

  //       .modal-background{
  //         position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; opacity: 0.3;
  //       }

  //       .modal-dialog{
  //         display:block;
  //         max-height: 400px;
  //         border: none;
  //         display: block;
  //         top: 68px;
  //         border-radius: 10px;
  //         background-color: white;
  //         position: fixed;
  //         font-family:Arial;
  //         opacity:1.0;
  //         box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
  //         width: 441px;
  //         overflow:hidden;
  //         padding: 1rem;
  //       }`);

  //     let component = `
  //         <dialog class="modal-dialog">
  //           <h1 style="padding:0.5rem 1rem;">Errors & Suggestions:-</h1>
  //           <button class="close-modal">✘</button>
  //           <ul style="margin-left:5%; max-height:254px; overflow: auto;margin-top: -3%;">
  //             ${errorMessagesArray
  //               .map((e) =>
  //                 typeof e === "string"
  //                   ? `<li style="padding:0.5rem;margin-left: 4%;">${e}</li>`
  //                   : `<li style="padding:0.5rem;margin-left: 4%;"><b> Img error:-</b> ${
  //                       e.errorMessage
  //                     }</li> <ul  style="margin-left:5%; max-height:600px; overflow: auto; scrollbar-width: none;"> <li style="padding:0.5rem;margin-left: 4%;line-height:14px;"> <b>Img Name:-</b> ${
  //                       e.imgSrc.trim().split("/")[
  //                         e.imgSrc.trim().split("/").length - 1
  //                       ]
  //                     }</li></ul>`
  //               )
  //               .join("")}
  //           </ul>
  //         </dialog>
  //       `;
  //     document.body.appendChild(bgDiv);
  //     document.querySelector("body").innerHTML += component;

  //     const closeButton = document.querySelector(".close-modal");
  //     closeButton.addEventListener("click", function () {
  //       const dialogElement = document.querySelector("dialog");
  //       const bgDiv = document.querySelector(".modal-background");

  //       if (dialogElement && bgDiv) {
  //         bgDiv.remove();
  //         dialogElement.remove();
  //       }
  //     });
  //   }
  return errorMessagesArray;
}

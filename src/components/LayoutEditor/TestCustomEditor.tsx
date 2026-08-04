import React, { useEffect, useState } from 'react';
import "./Custom.css"

const CustomContextMenu = () => {
  const storedHtml = localStorage.getItem("see");
  const [editor, setEditor] = useState(true);
  const [contextMenuStyle, setContextMenuStyle] = useState({ display: 'none', left: 0, top: 0 });
  const [initial, setInitial] = useState(storedHtml || "Right-click to see custom options.");

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuStyle({ display: 'block', left: e.pageX, top: e.pageY });
    document.addEventListener('click', hideContextMenu);
  };

  const hideContextMenu = () => {
    setContextMenuStyle({ display: 'none', left: 0, top: 0 });
    document.removeEventListener('click', hideContextMenu);
  };

  const formatText = (tag, styles) => {
    const selection = document.getSelection();
    // console.log(selection,"selection")
    const range = selection.getRangeAt(0);
     const selectedText = range.toString();

  // Now you can use the 'selectedText' variable to access the extracted content
  // console.log(selectedText);
  // Get the current selection

// Check if there is any selected text
if (selection.rangeCount > 0) {
  // Get the first range of the selection
  const range = selection.getRangeAt(0);

  // Extract the text content from the range
  const selectedText = range.toString();

  // Get the common ancestor container for the selected range
  const commonAncestorContainer = range.commonAncestorContainer;

  // Check if the commonAncestorContainer is an element
  if (commonAncestorContainer.nodeType === 1) {
    // Get the computed styles of the commonAncestorContainer
    const styles = window.getComputedStyle(commonAncestorContainer as Element);
    // console.log("Selected Text: ", selectedText);
//     console.log("Associated Styles: ", styles);

    // Collect tags associated with the selected text
    const tags = [];
    let currentNode = commonAncestorContainer;
    while (currentNode && currentNode !== document.body) {
      // Ensure currentNode is an element and has a tagName property
      if (currentNode.nodeType === 1 && (currentNode as Element).tagName) {
        tags.push((currentNode as Element).tagName.toLowerCase());
      }
      currentNode = currentNode.parentNode;
    }

    // console.log("Associated Tags: ", tags);
  } else {
    // console.log("Selected text is not within an element with styles.");
  }
} else {
  // console.log("No text selected.");
}

    
    const element = document.createElement(tag);
    element.style.cssText = styles;

    element.appendChild(range.extractContents());
    range.insertNode(element);
  };

  const createLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const handleSave = () => {
    setEditor(prev => !prev);
    let data = document.getElementById("editable").innerHTML;
    setInitial(data);
    localStorage.setItem("see", data);
  };

  useEffect(() => {
    document.getElementById("editable").innerHTML = initial;
  }, [initial]);

  return (
    <div>
      <div
        id="editable"
        contentEditable={editor}
        onContextMenu={showContextMenu}
        style={{ border: '1px solid #ccc', padding: '10px', resize: 'both' as const, width: "500px", height: "500px" }}
      >
        {initial}
      </div>
      <button onClick={handleSave}>Save</button>
      <div
        style={{
          display: contextMenuStyle.display,
          position: 'absolute',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ccc',
          minWidth: '120px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          zIndex: 1,
          left: contextMenuStyle.left + 'px',
          top: contextMenuStyle.top + 'px',
        }}
      >
        <button style={{color:"red"}} onClick={() => formatText('strong', '')}>
          Bold
        </button><br/>
        <button style={{color:"red"}} >
          unBold
        </button>
        <a href="#" onClick={() => formatText('em', '')}>
          Italic
        </a>
        <a href="#" onClick={() => formatText('font', 'font-size: 10px; line-height: 10px; vertical-align: 4px; color: #151515;')}>
          Superscript
        </a>
        <a href="#" onClick={createLink}>
          Create Link
        </a>
      </div>
    </div>
  );
};

export default CustomContextMenu;

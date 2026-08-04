import React, { useState } from 'react';

function DeeplinkGen() {
  const [inputUrl, setInputUrl] = useState('');
  const [businessUnit, setBusinessUnit] = useState('pharma');
  const [outputType, setOutputType] = useState('mass');
  const [outputUrl, setOutputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const convertUrl = () => {
    const [baseUrl, query] = inputUrl.includes('/?') ? inputUrl.split('/?') : inputUrl.split('?');
    if (!query) {
      displayError("Invalid URL. No query parameters found.");
      return;
    }

    let [queryParams, tag] = query.includes('#') ? query.split('#') : [query, ''];
    const params = new URLSearchParams(queryParams);

    const ccParam = params.get('cc');
    const tokenParam = params.get('token');

    if (!ccParam || !tokenParam) {
      displayError("Invalid URL. Missing 'cc' or 'token' parameter.");
      return;
    }

    if ((outputType === 'mass' && ccParam.includes('oto_veev')) || 
        (outputType === 'veeva' && ccParam.includes('ema_sfmc'))) {
      displayError(`Given link is ${outputType === 'mass' ? 'Veeva' : 'Mass'} Claravine not possible to ${outputType}.`);
      return;
    }

    let outputUrl = `${baseUrl}.modernDeeplink.json?` +
      `modern-deeplink=true&` +
      `mdmid=${outputType === 'mass' ? '%%MDMID%%' : '{{Account.CORE_GSK_MDM_ID__c}}'}&` +
      `email=${outputType === 'mass' ? '%%Email%%' : '{{Account.PersonEmail}}'}&` +
      `cc=${ccParam}&` +
      `token=${tokenParam}&` +
      `bu=${businessUnit}` +
      (tag ? `#${tag}` : '');

    setOutputUrl(outputUrl);
    setErrorMessage('');
  };

  const displayError = (message) => {
    setOutputUrl('');
    setErrorMessage(message);
  };

  return (
    <div>
      <h1>Deep Link URL Converter</h1>
      <div className="input-group">
        <label id='AltNames' className="labels" htmlFor="inputUrl">Input URL:</label>
        <input
         className='InputBox input-custom-field'
          type="text"
          id="inputUrl"
          value={inputUrl}
          style={{width:"100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter the URL"
        />
      </div>
      <div className="input-group">
        <label htmlFor="businessUnit" id='AltNames' className="labels">Select Business Unit:</label>
        <select
         className='InputBox input-custom-field'
         style={{padding:"8px", width: "100%", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc"}}
          id="businessUnit"
          value={businessUnit}
          onChange={(e) => setBusinessUnit(e.target.value)}
        >
          <option value="pharma">Pharma</option>
          <option value="viiv">ViiV</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="outputType" id='AltNames' className="labels">Select Output Type:</label>
        <select
         className='InputBox input-custom-field'
          id="outputType"
          style={{padding:"8px", width: "100%", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc"}}
          value={outputType}
          onChange={(e) => setOutputType(e.target.value)}
        >
          <option value="mass">Mass</option>
          <option value="veeva">Veeva</option>
        </select>
      </div>
      <br/>
      <button id='ThemeButtonSave' className="btn-accent" style={{ padding: "8px 16px", background: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={convertUrl}>Convert</button>
      <div className="output-group" style={{borderBottom:"2px dashed black",marginBottom:"5px", marginTop: "15px"}}>
        <h2>Output:</h2>
        <p><span id="outputUrl" style={{ wordBreak: "break-all" }}>{outputUrl}</span></p>
        <p className="error" id="errorMessage" style={{ color: "red" }}>{errorMessage}</p>
      </div>
    </div>
  );
}

export default DeeplinkGen;

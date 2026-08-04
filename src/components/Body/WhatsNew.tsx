import React from 'react';
import './WhatsNew.css'; // Import your CSS file for styling

const WhatsNew = () => {
  return (
    <div className="update-container">
      <h2 className="important-header">Action Items completed from 14th November</h2>
      
      <ul>
        <li><strong>Added bullet points component in body</strong></li>
        <li><strong>Editing functionalities for all components</strong> (paragraph and Layouts cannot get previous values)</li>
        <li><strong>Added new component i2cta component</strong></li>
        <li><strong>Survey with 5 images new component</strong></li>
        <li><strong>Added image state management overall flow of application with random string image names</strong></li>
        <li><strong>Image Gallery specific to that email</strong></li>
        <li><strong>Client-side logic to remove server-side URL in image src and make ready to Veeva Vault friendly</strong></li>
        <li><strong>Update Image adding option at all components so that user can select images from an existing gallery and preview option</strong></li>
      </ul>

      {/* Continue adding sections for each category of updates */}
      
      <h3 className="important-header">Special route to Admin Footers (Both Client side and server Side)</h3>
      <ul>
        <li><strong>Get existing footers</strong></li>
        <li><strong>Post new footer</strong></li>
        <li><strong>Update Existing footer</strong></li>
        <li><strong>Delete Existing footer</strong></li>
        <li><strong>Special algorithm to update given footer with the corresponding brand colors for all footer links</strong></li>
      </ul>

      {/* Continue adding sections for other categories of updates */}
      
      <h3 className="important-header">Special route to Admin Headers (Both Client side and server Side)</h3>
      <ul>
        <li><strong>Get existing Headers</strong></li>
        <li><strong>Post new Headers</strong></li>
        <li><strong>Update Existing Headers</strong></li>
        <li><strong>Delete Existing Headers</strong></li>
      </ul>

      <pre>
      -	Export button not only download html file but also corresponding images.zip file along with output pdf file with (three pages required by client)
-	New feature Code Mode – IDE (Integrated Development Environment)
o	New Code Editor component created 
o	Preview mode and code Editing given to edit existing component
o	Syntax highlight feature in the iDE 
o	Auto intelligence sense code filling for IDE
-	Pci module icon image not functional - fixed
-	Template gallery
o	Front end ui to show all templates existing
o	Backed to save templates by user In json form
o	Get existing templates to front end using api
o	Make existing templates usable to user
o	When using template make image gallery fill with only those images that are already used in that particular email.
o	Keep time at which template is created along with date and person who created it
o	Search feature based on pm number frontend and backend
o	Preview Tag that can make single selected email to show full preview
o	Search feature based on date of created using calendar
-	Pdf generated should also have pre-Header automatically
-	Validate image format while uploading - done
-	Dedicated spacing component that give spacing between fragments + edit feature as well.
-	Add dynamic signature with up arrow also also given edit feature and code mode
-	Bug reports by verbal communication
-	
-	Fix - pdf creation pre-header issue if there is not preheader its still creating it,
-	Fix - for mass email arrow icon don't have alt text still creating issue by making image width to be more than usual
-	Fix = span is adding in the paragraph but it needs font tag.
-	Fix &amp with &nbsp while adding new footers
-	provided the paragraph text preview mode

      </pre>

      {/* Continue adding sections for other categories of updates */}
    </div>
  );
};

export default WhatsNew;

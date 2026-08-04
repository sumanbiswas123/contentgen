import { Route, Routes } from "react-router-dom";
import Home from "./HomeRoute";
import CypressTestContent from "../QA/ResultBody";
import SavedTemplate from "../SavedTemplate/SavedTemplate";
import Login from "../Auth/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
// import Dashboard from "./Dashboard";
import TextEditor from "../LayoutEditor/TextEditor";
import StandardTemplete from "../Gsk_template/standardTemplete";
import FooterModalView from "../Footers/FooterModalView";
import PDFpage from "../PDFmaker/PDF";
import FooterAdminBoard from "../Body/FooterAdminBoard";
import HeaderAdminBoard from "../Body/HeaderAdminBoard";
import Dashboard from "../Dashboards/Dashboard";
import DeveloperDashboard from "../Dashboards/DeveloperDashboard";
import QualityDashboard from "../Dashboards/QualityDashboard";

function AllRoutes() {

  return (
    <div className="all-routes-wrapper">
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/Preview"
          element={
            <PrivateRoute>
              <StandardTemplete />
            </PrivateRoute>
          }
        />
        <Route
          path="/test-result"
          element={
            <PrivateRoute>
              <CypressTestContent />
             </PrivateRoute>
          }
        />
        <Route
          path="/templates"
          element={
              <PrivateRoute>
              <SavedTemplate />
            </PrivateRoute>
          }
        />
        <Route
          path="/TextEditor"
          element={
             <PrivateRoute>
              {/* @ts-ignore */}
              <TextEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/FooterModal"
          element={
            <PrivateRoute>
              <FooterModalView />
            </PrivateRoute>
          }
        />
        <Route
          path="/pdf"
          element={
            //  <PrivateRoute>
              <PDFpage />
            // </PrivateRoute>
          }
        />
        <Route
          path="/FooterAdminBoard"
          element={
            <PrivateRoute>
              <FooterAdminBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/HeaderAdminBoard"
          element={
             <PrivateRoute>
              <HeaderAdminBoard />
             </PrivateRoute>
          }
        />

        <Route
          path="/developer-dashboard"
          element={
             <PrivateRoute>
              <Dashboard />
             </PrivateRoute>
          }
        />

        <Route
          path="/developer-dashboard-not-using"
          element={
             <PrivateRoute>
              <DeveloperDashboard />
             </PrivateRoute>
          }
        />

      <Route
          path="/quality-dashboard"
          element={
             <PrivateRoute>
              <QualityDashboard />
             </PrivateRoute>
          }
        />
      
        <Route path="/login" element={ <Login />} />



        {/* <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        /> */}

        {/* <Route
          path="/Edit-email"
          element={
            <PrivateRoute>
              <UpdateEmail />
            </PrivateRoute>
          }
        /> */}

        {/* <Route
          path="/test-result"
          element={
            <PrivateRoute>
              <CypressTestContent />
            </PrivateRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <PrivateRoute>
              <SavedTemplate />
            </PrivateRoute>
          }
        /> */}
      </Routes>
    </div>
  );
}

export default AllRoutes;

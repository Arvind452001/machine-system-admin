import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import AddMachine from "./pages/AddMachine";
import MachineDetails from "./pages/MachineDetails";
import Cr80Details from "./pages/Cr80Details";
import Mx220Details from "./pages/Mx220Details";
import Pl600Details from "./pages/Pl600Details";
import Options from "./pages/Options";
import AddOption from "./pages/AddOption";
import Pricing from "./pages/Pricing";
import AddPriceRule from "./pages/AddPriceRule";
import Renderings from "./pages/Renderings";
import UploadRendering from "./pages/UploadRendering";
import Enquiries from "./pages/Enquiries";
import EnquiryDetails from "./pages/EnquiryDetails";
import Quotes from "./pages/Quotes";
import QuoteDetails from "./pages/QuoteDetails";
import Representatives from "./pages/Representatives";
import InviteRepresentative from "./pages/InviteRepresentative";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/index.html" element={<SignIn />} />

        {/* Dashboard / Workspace */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard.html" element={<Dashboard />} />

        {/* Machines */}
        <Route path="/machines" element={<Machines />} />
        <Route path="/machines.html" element={<Machines />} />
        <Route path="/add-machine" element={<AddMachine />} />
        <Route path="/add-machine.html" element={<AddMachine />} />
        <Route path="/machine-details" element={<MachineDetails />} />
        <Route path="/machine-details.html" element={<MachineDetails />} />
        <Route path="/cr80-details" element={<Cr80Details />} />
        <Route path="/cr80-details.html" element={<Cr80Details />} />
        <Route path="/mx220-details" element={<Mx220Details />} />
        <Route path="/mx220-details.html" element={<Mx220Details />} />
        <Route path="/pl600-details" element={<Pl600Details />} />
        <Route path="/pl600-details.html" element={<Pl600Details />} />

        {/* Options & Rules */}
        <Route path="/options" element={<Options />} />
        <Route path="/options.html" element={<Options />} />
        <Route path="/add-option" element={<AddOption />} />
        <Route path="/add-option.html" element={<AddOption />} />

        {/* Pricing */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/pricing.html" element={<Pricing />} />
        <Route path="/add-price-rule" element={<AddPriceRule />} />
        <Route path="/add-price-rule.html" element={<AddPriceRule />} />

        {/* Renderings */}
        <Route path="/renderings" element={<Renderings />} />
        <Route path="/renderings.html" element={<Renderings />} />
        <Route path="/upload-rendering" element={<UploadRendering />} />
        <Route path="/upload-rendering.html" element={<UploadRendering />} />

        {/* Enquiries */}
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/enquiries.html" element={<Enquiries />} />
        <Route path="/enquiry-details" element={<EnquiryDetails />} />
        <Route path="/enquiry-details.html" element={<EnquiryDetails />} />

        {/* Quotes */}
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/quotes.html" element={<Quotes />} />
        <Route path="/quote-details" element={<QuoteDetails />} />
        <Route path="/quote-details.html" element={<QuoteDetails />} />

        {/* Representatives */}
        <Route path="/representatives" element={<Representatives />} />
        <Route path="/representatives.html" element={<Representatives />} />
        <Route path="/invite-representative" element={<InviteRepresentative />} />
        <Route path="/invite-representative.html" element={<InviteRepresentative />} />

        {/* Activity & Settings */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications.html" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile.html" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings.html" element={<Settings />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

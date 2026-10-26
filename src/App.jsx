import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import AddMachine from "./pages/AddMachine";
import Categories from "./pages/Categories";
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

/**
 * LegacyHtmlRedirect handles backward compatibility for URLs with `.html` extensions,
 * redirecting them seamlessly to clean canonical routes.
 */
const LegacyHtmlRedirect = () => {
  const { page } = useParams();
  const location = useLocation();
  const target = !page || page === "index" ? "/" : `/${page}`;
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Authentication Routes (redirect to /dashboard if already logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<SignIn />} />
            <Route path="/login" element={<SignIn />} />
          </Route>
          <Route path="/index" element={<Navigate to="/login" replace />} />

          {/* Protected Routes (require dummy auth in localStorage or real API session) */}
          <Route element={<ProtectedRoute />}>
            {/* Workspace */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Machines & Categories */}
            <Route path="/machines" element={<Machines />} />
            <Route path="/add-machine" element={<AddMachine />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/add-category" element={<Navigate to="/categories" replace />} />
            <Route path="/edit-category/:id" element={<Navigate to="/categories" replace />} />
            <Route path="/machine-details" element={<MachineDetails />} />
            <Route path="/cr80-details" element={<Cr80Details />} />
            <Route path="/mx220-details" element={<Mx220Details />} />
            <Route path="/pl600-details" element={<Pl600Details />} />

            {/* Options & Rules */}
            <Route path="/options" element={<Options />} />
            <Route path="/add-option" element={<AddOption />} />

            {/* Pricing */}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/add-price-rule" element={<AddPriceRule />} />

            {/* Renderings */}
            <Route path="/renderings" element={<Renderings />} />
            <Route path="/upload-rendering" element={<UploadRendering />} />

            {/* Enquiries */}
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/enquiry-details" element={<EnquiryDetails />} />

            {/* Quotes */}
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quote-details" element={<QuoteDetails />} />

            {/* Representatives */}
            <Route path="/representatives" element={<Representatives />} />
            <Route path="/invite-representative" element={<InviteRepresentative />} />

            {/* Activity & Settings */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Fallback for authenticated users */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Legacy .html Redirects */}
          <Route path="/:page.html" element={<LegacyHtmlRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

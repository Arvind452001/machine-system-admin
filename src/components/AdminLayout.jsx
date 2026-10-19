import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = ({ children, breadcrumb, bodyClass = "" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (bodyClass) {
      document.body.className = bodyClass;
    } else {
      document.body.className = "";
    }
    return () => {
      document.body.className = "";
    };
  }, [bodyClass]);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={`sidebar-scrim ${isSidebarOpen ? "is-visible" : ""}`}
        id="sidebarScrim"
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <main className="main-content">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          breadcrumb={breadcrumb}
        />
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

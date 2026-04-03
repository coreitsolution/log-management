import { useState } from "react";
import { Outlet } from "react-router-dom";

// Components
import Navbar from "./Navbar";

const MainLayout = () => {
  const [open, setOpen] = useState(false);  
  
  return (
    <>
      <Navbar open={open} setOpen={setOpen} />
      <main
        style={{
          height: "calc(100vh - 64px)",
          marginLeft: open ? 300 : 0,
          backgroundColor: "var(--main-bg-color)",
          marginTop: 64,
          transition: "margin 0.3s ease",
        }}
      >
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
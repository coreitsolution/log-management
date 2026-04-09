import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Material UI
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Avatar from '@mui/material/Avatar';
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Icons
import LogoutIcon from "../assets/icons/logout.png";
import SubMenuIcon from "../assets/icons/sub-menu.png";

// Constants
import { MENU_ITEMS } from "../constants/nav";

type NavbarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbar = ({ open, setOpen }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  const toggleSubMenu = (index: number) => {
    setOpenMenus((prev) => {
      const isCurrentlyOpen = prev[index];

      return {
        [index]: !isCurrentlyOpen,
      };
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          backgroundColor: "var(--secondary-color)",
          boxShadow: "1px 1px 5px rgba(0, 0, 0, 0.1)",
          color: "var(--primary-color)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <div className="flex">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              {open ? <CloseIcon sx={{ fontSize: 35 }} /> : <MenuIcon sx={{ fontSize: 35 }} />}
            </IconButton>

            <div className="flex gap-2 items-center justify-center">
              <img src="/project-logo/logo.png" alt="Logo" className="h-10 w-10" />
              <div className="flex flex-col">
                <Typography variant="h6" sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  NSB License Plate
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: "0.6rem", mt: -0.8 }}>
                  Narcotics Suppression Bureau
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center">
            <Typography variant="body1" sx={{ fontSize: "1rem", color: "#9E9E9E" }}>
              ดต.ญ.สุมาลี บุญเลิศ
            </Typography>
            <div 
              className="bg-[--secondary-color] rounded-full shadow-[0px_1px_3px_rgba(0,0,0,0.2)] p-0.5 h-11 w-11"
            >
              <Avatar alt="User" src="/avatars/user1.png" />
            </div>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={toggleDrawer}
            >
              <img src={LogoutIcon} alt="Logout" className="h-6 w-6" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer 
        anchor="left" 
        open={open} 
        onClose={toggleDrawer} 
        variant="persistent"
        ModalProps={{
          hideBackdrop: true,
          sx: {
            pointerEvents: "none",
          },
        }}
        slotProps={{
          paper: {
            sx: {
              pointerEvents: "auto",
              top: "64px",
              height: "calc(100% - 64px)",
              overflowY: "auto",
              backgroundColor: "var(--primary-color)",
              color: "var(--secondary-color)",
            },
          }
        }}
      >
        <Box sx={{ width: 300, py: 3, gap: 1, display: "flex", flexDirection: "column" }}>
          {
            MENU_ITEMS.map((item, index) => {
              const isOpen =
                openMenus[index] ||
                item.subMenu.some((sub) => sub.path === location.pathname);

              return (
                <Box key={`menu-item-${index}`}>
                  
                  {/* Main Menu */}
                  <Box
                    onClick={() => toggleSubMenu(index)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <Box className="flex gap-2 items-center">
                      <img src={SubMenuIcon} className="w-6 h-6" />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.98rem" }}>
                        {item.label}
                      </Typography>
                    </Box>

                    <ExpandMoreIcon
                      sx={{
                        transition: "0.3s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </Box>

                  {/* Sub Menu */}
                  <Box
                    sx={{
                      overflow: "hidden",
                      maxHeight: isOpen ? 300 : 0,
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateY(0)" : "translateY(-5px)",
                      transition: "all 0.1s ease",
                    }}
                  >
                    <List>
                      {item.subMenu.map((subItem, subIndex) => (
                        <ListItemButton
                          key={`sub-menu-item-${subIndex}`}
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            pl: 6,
                            backgroundColor:
                              location.pathname === subItem.path
                                ? "var(--secondary-color)"
                                : "transparent",
                            color:
                              location.pathname === subItem.path
                                ? "var(--primary-color)"
                                : "inherit",
                            "&:hover": {
                              backgroundColor: "var(--secondary-color)",
                              color: "var(--primary-color)",
                            },
                          }}
                        >
                          <ListItemText primary={subItem.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Box>
              );
            })
          }
        </Box>
      </Drawer>
    </Box>
  )
}

export default Navbar;
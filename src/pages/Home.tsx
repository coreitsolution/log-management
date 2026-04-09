import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// Material UI
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

// Constants
import { MENU_ITEMS } from "../constants/nav";

const Home = () => {
  const navigate = useNavigate();

  const getTimeOfDay = () => {
    const hour = dayjs().hour();

    if (hour >= 5 && hour < 12) return "สวัสดีตอนเช้า";
    if (hour >= 12 && hour < 17) return "สวัสดีตอนบ่าย";
    if (hour >= 17 && hour < 21) return "สวัสดีตอนเย็น";
    return "สวัสดีตอนกลางคืน";
  };

  return (
    <section id='home'>
      <Box className="p-5 flex flex-col gap-4 w-full">
        {/* Header */}
        <Box className="flex justify-between items-center bg-(--primary-color) p-7 rounded-lg">
          <Box className="flex flex-col text-(--secondary-color) gap-1">
            <p className="text-sm opacity-75">ระบบบริหารจัดการ</p>
            <h1 className="font-bold text-2xl">NSB Log Management</h1>
          </Box>
          <Box className="flex flex-col text-(--secondary-color) text-right gap-1">
            <p className="text-sm opacity-75">{getTimeOfDay()}</p>
            <h1 className="font-bold text-lg opacity-90">{dayjs().format("dddd D MMMM BBBB")}</h1>
          </Box>
        </Box>
        {/* Menu */}
        <Box className="grid grid-cols-4 gap-4">
          {
            MENU_ITEMS.map((item, index) => (
              <Box key={`menu_${index}`} className="flex flex-col bg-(--secondary-color) rounded-xl p-5 border border-(--table-border-color)">
                <h2 className="text-(--primary-color) text-sm font-bold">{item.label}</h2>
                <Divider sx={{ width: "100%", borderColor: "var(--table-border-color)", borderWidth: "px", my: "5px" }} />
                {
                  item.subMenu.map((subItem, subIndex) => (
                    <Box 
                      key={`sub_menu_${subIndex}`} 
                      className="flex gap-2 px-4 py-1 text-sm"
                      onClick={() => navigate(subItem.path)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "var(--range-button-color-hover)",
                          borderRadius: "5px",
                          color: "var(--primary-color-hover)",
                          cursor: "pointer",
                        }
                      }}
                    >
                      <p>{`→ ${subItem.label}`}</p>
                    </Box>
                  ))
                }
              </Box>
            ))
          }
        </Box>
      </Box>
    </section>
  )
}

export default Home;
import { useState, useCallback, useEffect } from 'react'
import { Map as LeafletMap, point } from 'leaflet';
import dayjs from "dayjs";

// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Components
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
import BaseMap from '../base-map/BaseMap';

// Icons
import ClearIcon from "../../assets/icons/clear-secondary.png";
import SearchIcon from "../../assets/icons/search.png";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

interface FormData {
  start_date_time: Date | null;
  end_date_time: Date | null;
}

type Props = {
  open: boolean;
  handleClose: () => void;
  dialogTitle: string;
  data: any[];
}

const LocationUsage = ({ open, handleClose, dialogTitle, data }: Props) => {

  // Data
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    start_date_time: dayjs().toDate(),
    end_date_time: dayjs().toDate(),
  });

  const { 
    searchPlaceWithList, 
    clearSearchPlaces, 
    isSearching 
  } = useMapSearch(map);

  useEffect(() => {
    if (map) {
      clearSearchPlaces();
      const updateData = data.map((item) => ({
        location: `${item.latitude}, ${item.longitude}`,
        name: `${item.latitude}, ${item.longitude}`,
      }));
      searchPlaceWithList(updateData, "#FDCC0A", true);
    }
  }, [data, map])

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleClear = () => {
    setFormData({
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    });
  }

  return (
    <Dialog 
      open={open} 
      fullWidth 
      maxWidth="lg"
      slotProps={{
        root: {
          sx: {
            zIndex: (theme) => theme.zIndex.drawer - 1,
          },
        },
        paper: {
          sx: {
            boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.2)",
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          color: "var(--primary-color)",
          fontWeight: "bold",
        }}
      >
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        <Box className="flex flex-col gap-4">
          <Box 
            className="grid grid-cols-[repeat(2,1fr)_200px] border border-[#C5C8CB] rounded-[10px] p-4 gap-2"
            sx={{
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <DatePickerBuddhist
              value={formData.start_date_time}
              sx={{
                marginTop: "5px",
                borderRadius: "5px",
                backgroundColor: "white",
                "& .MuiTextField-root": {
                  height: "fit-content",
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: 14,
                },
              }}
              className="w-full"
              id="start-date-time"
              onChange={(value) =>
                handleDateTimeChange("start_date_time", value)
              }
              label={"วันเริ่มต้น"}
              labelFontSize="14px"
            />

            <DatePickerBuddhist
              value={formData.end_date_time}
              sx={{
                marginTop: "5px",
                borderRadius: "5px",
                backgroundColor: "white",
                "& .MuiTextField-root": {
                  height: "fit-content",
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: 14,
                },
              }}
              className="w-full"
              id="end-date-time"
              onChange={(value) =>
                handleDateTimeChange("end_date_time", value)
              }
              label={"วันสิ้นสุด"}
              labelFontSize="14px"
            />

            <Box className="flex gap-2 items-end">
              <Button 
                variant="contained" 
                startIcon={<img src={SearchIcon} alt="Clear" className="h-4 w-4" />} 
                sx={{ 
                  backgroundColor: "var(--primary-color)", 
                  fontSize: "14px", 
                  width: "120px",
                  height: "40px",
                  "&:hover": {
                    backgroundColor: "var(--primary-color-hover)",
                  },
                }}
                onClick={handleClear}
              >
                ค้นหา
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<img src={ClearIcon} alt="Clear" className="h-4 w-4" />} 
                sx={{ 
                  border: "1px solid var(--primary-color)",
                  backgroundColor: "var(--secondary-color)",
                  fontSize: "14px", 
                  width: "120px",
                  height: "40px",
                  "&:hover": {
                    backgroundColor: "var(--range-button-color-hover)",
                  },
                }}
                onClick={handleClear}
              >
                ล้าง
              </Button>
            </Box>
          </Box>
          <Box className="relative h-[60vh] w-full border border-(--primary-color)">
            <BaseMap 
              onMapLoad={handleMapLoad}
            />
          </Box>
          <Box className="flex justify-end">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--primary-color)"
              }}
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default LocationUsage;
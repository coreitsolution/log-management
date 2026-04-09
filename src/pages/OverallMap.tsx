import React, { useState, useCallback, useEffect } from 'react'
import { Map as LeafletMap } from 'leaflet';
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from 'react-redux';

// Material UI
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

// Components
import BaseMap from '../components/base-map/BaseMap';
import AutoComplete from "../components/auto-complete/AutoComplete";
import TextBox from "../components/text-box/TextBox";

// Icons
import ClearIcon from "../assets/icons/clear.png";

// Hooks
import { useMapSearch } from "../hooks/useOpenStreetMapSearch";
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// Utils
import { buildOptions } from "../utils/commonFunctions";

// Mocks
import { mockOverallMapDetail } from "../mocks/mockOverallMapDetail";

interface FormData {
  search_word: string;
  area_id: string;
  province_id: string;
  type_id: string;
}

const OverallMap = () => {
  usePageTitle("แผนที่");

  // State
  const [showFilter, setShowFilter] = useState(false);

  // Data
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Options
  const [areaOptions, setAreaOptions] = useState<{ label: string, value: string }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: string }[]>([]);
  const [typeOptions, setTypeOptions] = useState<{ label: string, value: string }[]>([]);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    search_word: "",
    area_id: "0",
    province_id: "0",
    type_id: "0",
  });
  
  const { 
    showOverallWithList, 
    clearSearchPlaces,
  } = useMapSearch(map);

  // Slice
  const { area, province, checkpointType } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    if (map) {
      showOverallWithList(mockOverallMapDetail);
    }
  }, [map, formData]);

  useEffect(() => {
    setAreaOptions(buildOptions(area, "ทุกพื้นที่"));
    setProvinceOptions(buildOptions(province, "ทุกจังหวัด"));
    setTypeOptions(buildOptions(checkpointType, "ทุกประเภท"));
  }, [area, province, checkpointType]);

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDropdownChange = (
    event: React.SyntheticEvent,
    key: keyof typeof formData,
    value: { value: any ,label: string } | null,
  ) => {
    event.preventDefault();
    setFormData((prev) => ({ ...prev, [key]: value?.value ?? 0 }));
  };

  const handleClear = () => {
    setFormData({
      search_word: "",
      area_id: "0",
      province_id: "0",
      type_id: "0",
    });
    clearSearchPlaces();
  }

  return (
    <section id='overall-map'>
      <Box className="relative"
        sx={{
          height: "calc(100vh - 64px)",
        }}
      >
        <BaseMap 
          onMapLoad={handleMapLoad}
          zoomControl={true}
          fullscreenControl={true}
          currentLocation={true}
          searchFilter={true}
          mapStyle={true}
          showFilter={showFilter}
          onSearchFilterClick={() => setShowFilter(true)}
        />

        <AnimatePresence>
          {showFilter && (
            <motion.div 
              initial={{ x: -100, opacity: 0, scaleX: 0.5, originX: 0 }}
              animate={{ x: 0, opacity: 1, scaleX: 1 }}
              exit={{ x: -50, opacity: 0, scaleX: 0, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                damping: 15,
                mass: 1
              }}
              className="absolute top-0 left-0 z-1000"
            >
              <Box
                className="flex flex-col gap-2 relative border border-(--primary-color)"
                sx={{
                  zIndex: 1000,
                  backgroundColor: "white",
                  borderRadius: 2,
                  padding: "25px 15px 15px 15px",
                  boxShadow: 3,
                  width: 650,
                  margin: 1,
                }}
              >
                <Box className="absolute top-2 right-2 flex justify-end items-center w-full">
                  <img
                    src="/src/assets/svg/close.svg"
                    alt="Close"
                    className="w-2.5 h-2.5 cursor-pointer"
                    onClick={() => setShowFilter(false)}
                  />
                </Box>
                <Box className="grid grid-cols-[repeat(4,minmax(0,1fr))_40px] items-end gap-2">
                  <TextBox
                    sx={{ marginTop: "5px", fontSize: "15px" }}
                    id="search-word"
                    label={""}
                    placeholder={"ค้นหา"}
                    labelFontSize="14px"
                    value={formData.search_word}
                    onChange={(event) =>
                      handleTextChange("search_word", event.target.value)
                    }
                  />

                  <AutoComplete 
                    id="area-select"
                    sx={{ marginTop: "5px" }}
                    value={formData.area_id}
                    onChange={(event, value) => handleDropdownChange(event, "area_id", value)}
                    options={areaOptions}
                    label=""
                    placeholder="เลือกพื้นที่"
                    labelFontSize="14px"
                  />

                  <AutoComplete 
                    id="province-select"
                    sx={{ marginTop: "5px" }}
                    value={formData.province_id}
                    onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
                    options={provinceOptions}
                    label=""
                    placeholder="เลือกจังหวัด"
                    labelFontSize="14px"
                  />

                  <AutoComplete 
                    id="type-select"
                    sx={{ marginTop: "5px" }}
                    value={formData.type_id}
                    onChange={(event, value) => handleDropdownChange(event, "type_id", value)}
                    options={typeOptions}
                    label=""
                    placeholder="เลือกประเภท"
                    labelFontSize="14px"
                  />

                  <IconButton
                    sx={{
                      backgroundColor: "var(--primary-color)",
                      borderRadius: "5px",
                      width: "40px",
                      height: "40px",
                      "&:hover": {
                        backgroundColor: "var(--primary-color-hover)",
                      },
                    }}
                    onClick={handleClear}
                  >
                    <img src={ClearIcon} alt="Clear" className='w-5 h-5' />
                  </IconButton>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </section>
  )
}

export default OverallMap;
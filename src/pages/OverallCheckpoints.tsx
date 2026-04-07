import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { SelectChangeEvent } from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Components
import MainTitle from "../components/main-title/MainTitle";
import AutoComplete from "../components/auto-complete/AutoComplete";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationComponent from "../components/pagination/Pagination";
import DetailsDialog from "../components/details-dialog/DetailsDialog";
import TextBox from "../components/text-box/TextBox";

// Icons
import ClearIcon from "../assets/icons/clear.png";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";
import DatabaseOnline from "../assets/icons/database-online.png";
import DatabaseOffline from "../assets/icons/database-offline.png";
import WifiIcon from "../assets/svg/wifi.svg?react";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";
import { DEFAULT_COLUMN_OPTIONS } from "../constants/column";

// Types
import type { OverallCheckpointType, ColumnOption } from "../types/common";
import type { OverallCheckpointsPdfData } from "../types/pdf";

// Utils
import { exportExcel } from "../utils/exportData";

// PDF
import {
  generateOverallCheckpointsPdfBlob,
  downloadOverallCheckpointsPdf,
} from "../pdf/OverallCheckpointPdf";

// Mock Data
import { mockOverallCheckpoint } from "../mocks/mockOverallCheckpoint";

dayjs.extend(buddhistEra);

interface FormData {
  search: string;
  area_id: number;
  province_id: number;
  project_id: number;
}

type Props = {}

const OverallCheckpoints = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Options
  const [areaOptions, setAreaOptions] = useState<{ label: string, value: number }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: number }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string, value: number }[]>([]);
  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(DEFAULT_COLUMN_OPTIONS);

  // Data
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [rows, setRows] = useState<OverallCheckpointType[]>(mockOverallCheckpoint);
  const [selectedData, setSelectedData] = useState<OverallCheckpointType | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(
    ROWS_PER_PAGE_OPTIONS
  );

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    search: "",
    area_id: 0,
    province_id: 0,
    project_id: 0,
  });

  const columnKeyMap: Record<string, keyof typeof rows[0]> = {
    camera: "camera_name",
    station: "station_name",
    area: "area_name",
    province: "province_name",
    district: "district_name",
    subdistrict: "subdistrict_name",
    road: "road",
    route: "route",
    project: "project",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

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

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
    setValue(key, date);
  };

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    event.preventDefault();
    setPage(value);
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value);
    setRowsPerPage(limit);
  };

  const handleClear = () => {
    setFormData({
      search: "",
      area_id: 0,
      province_id: 0,
      project_id: 0,
    });
  }

  const handleExportExcel = async () => {
    await exportExcel({
      sheetName: "รายงานจุดตรวจ",
      fileName: `รายงานจุดตรวจ_${dayjs().format("BBBB-MM-DD")}.xlsx`,
      headers: [
        "ลำดับ",
        "จุดตรวจ",
        "ด่านตรวจ",
        "สถานีตำรวจ",
        "พื้นที่",
        "จังหวัด",
        "อำเภอ",
        "ตำบล",
        "ถนน",
        "เส้นทาง",
        "โครงการ",
      ],
      data: rows,
      mapRow: (data, index) => [
        (page - 1) * rowsPerPage + index + 1,
        data.checkpoint_name,
        data.camera_name,
        data.station_name,
        data.area_name,
        data.province_name,
        data.district_name,
        data.subdistrict_name,
        data.road,
        data.route === 1 ? "เข้า" : "ออก",
        data.project,
      ],
      columnStyles: {
        2: { alignment: { horizontal: "center" } },
      },
    });
  };

  const handleExportPdf = async () => {
    const pdfName = `รายงานจุดตรวจ_${dayjs().format("BBBB-MM-DD")}.pdf`;
    const pdfData: OverallCheckpointsPdfData[] = rows.map((data) => ({
      ...data,
      id: data.id,
      checkpoint_name: data.checkpoint_name,
      camera_name: data.camera_name,
      station_name: data.station_name,
      area_name: data.area_name,
      province_name: data.province_name,
      district_name: data.district_name,
      subdistrict_name: data.subdistrict_name,
      road: data.road,
      route: data.route === 1 ? "เข้า" : "ออก",
      project: data.project,
    }));
    await downloadOverallCheckpointsPdf(
      pdfData,
      pdfName,
    );
  };

  const handleColumnSelectChange = (key: string) => {
    setColumnOptions((prev) =>
      prev.map((option) =>
        option.key === key
          ? { ...option, checked: !option.checked }
          : option
      )
    );
  };

  const visibleColumns = columnOptions.filter((col) => col.checked);

  return (
    <section id='overall-checkpoint'>
      <Box className='p-4 flex flex-col gap-4'>
        {/* Main Title */}
        <MainTitle title="รายงานจุดตรวจ" />

        {/* Search Filters */}
        <Box 
          className="grid grid-cols-[repeat(5,minmax(0,1fr))_180px] border border-[#C5C8CB] rounded-[10px] p-4 gap-2 bg-(--secondary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            "& h6": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          <Box className="col-span-2">
            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="word-searching"
              label={"คำค้น"}
              placeholder={"ชื่อจุดตรวจ,ด่าน,สถานี"}
              labelFontSize="14px"
              value={formData.search}
              onChange={(event) =>
                handleTextChange("search", event.target.value)
              }
            />
          </Box>

          <AutoComplete 
            id="area-select"
            sx={{ marginTop: "5px"}}
            value={formData.area_id}
            onChange={(event, value) => handleDropdownChange(event, "area_id", value)}
            options={areaOptions}
            label="พื้นที่"
            placeholder="กรุณาเลือกพื้นที่"
            labelFontSize="14px"
          />

          <AutoComplete 
            id="province-select"
            sx={{ marginTop: "5px"}}
            value={formData.province_id}
            onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
            options={provinceOptions}
            label="จังหวัด"
            placeholder="กรุณาเลือกจังหวัด"
            labelFontSize="14px"
          />

          <AutoComplete 
            id="project-select"
            sx={{ marginTop: "5px" }}
            value={formData.project_id}
            onChange={(event, value) => handleDropdownChange(event, "project_id", value)}
            options={projectOptions}
            label="โครงการ"
            placeholder="กรุณาเลือกโครงการ"
            labelFontSize="14px"
          />

          <Box className="flex gap-2 items-end">
            <Button 
              variant="contained" 
              startIcon={<img src={ClearIcon} alt="Clear" className="h-6 w-6" />} 
              sx={{ 
                backgroundColor: "var(--primary-color)", 
                fontSize: "14px", 
                width: "90px" ,
                height: "40px",
              }}
              onClick={handleClear}
            >
              ล้าง
            </Button>
            <IconButton 
              sx={{ border: "1px solid var(--primary-color)", width: "40px", height: "40px", borderRadius: "5px" }}
              onClick={handleExportPdf}
            >
              <img src={ExportPdfIcon} alt="Export PDF" className="h-6 w-6" />
            </IconButton>
            <IconButton 
              sx={{ border: "1px solid var(--primary-color)", width: "40px", height: "40px", borderRadius: "5px" }}
              onClick={handleExportExcel}
            >
              <img src={ExportExcelIcon} alt="Export CSV" className="h-6 w-6" />
            </IconButton>
          </Box>
        </Box>

        {/* Table */}
        <PaginationComponent
          page={page}
          onChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          handleRowsPerPageChange={handleRowsPerPageChange}
          totalPages={totalPages}
          totalItems={totalItems}
          totalUsage={totalUsage}
          isShowColumn={true}
          columnOptions={columnOptions}
          onToggleColumn={handleColumnSelectChange}
        />
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
          >
            <Table
              sx={{ minWidth: 650, backgroundColor: "var(--secondary-color)" }}
              stickyHeader
            >
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "white",
                    backgroundColor: "var(--primary-color)",
                  },
                }}
              >
                <TableRow>
                  <TableCell align="center" width={"2%"}>ลำดับ</TableCell>
                  <TableCell align="center" width={"5%"}>สถานะ</TableCell>
                  <TableCell align="center" width={"8%"}>จุดตรวจ</TableCell>

                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} align="center" width={"8%"}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--secondary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                  >
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        p: "8px 1px",
                      }}
                    >
                      {((page - 1) * rowsPerPage) + index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        p: "8px 1px",
                      }}
                    >
                      <Box className="flex items-center justify-center gap-2">
                        <img src={data.database_status === 1 ? DatabaseOnline : DatabaseOffline} alt="Database Status" className="h-6 w-6" />
                        <WifiIcon className="h-6 w-6" color={data.wifi_status === 1 ? "#2FA534" : "#DD2025"} />
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        p: "8px 1px",
                      }}
                    >
                      {data.checkpoint_name}
                    </TableCell>
                    {visibleColumns.map((col) => {
                      const field = columnKeyMap[col.key];

                      let value = data[field];

                      if (col.key === "route") {
                        value = data.route === 1 ? "เข้า" : "ออก";
                      }

                      return (
                        <TableCell 
                          key={col.key}
                          sx={{
                            backgroundColor: "var(--secondary-color)",
                            color: "var(--table-text-color)",
                            borderBottom: "1px solid var(--table-border-color)",
                            textAlign: "center",
                            p: "8px 1px",
                          }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </section>
  )
}

export default OverallCheckpoints;
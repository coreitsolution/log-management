import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useSelector } from 'react-redux';

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

// Components
import MainTitle from "../components/main-title/MainTitle";
import AutoComplete from "../components/auto-complete/AutoComplete";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationComponent from "../components/pagination/Pagination";
import TextBox from "../components/text-box/TextBox";
import LocationUsage from "../components/location-usage/LocationUsage";
import Loading from "../components/loading/Loading";

// Icons
import ClearIcon from "../assets/icons/clear.png";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// Types
import type { LogUsage } from "../types/common";
import type { LogUsagePdfData } from "../types/pdf";

// Utils
import { exportExcel } from "../utils/exportData";
import { buildOptions } from "../utils/commonFunctions";

// PDF
import {
  downloadStatisticUsageLogPdf,
} from "../pdf/StatisticUsageLogPdf";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { getLogUsage } from "../features/usage-data/api/UsageDataApi";

dayjs.extend(buddhistEra);

interface FormData {
  name: string;
  pid_or_water_mark: string;
  agency_id: string;
  bh_id: string;
  bk_id: string;
  org_id: string;
  start_date_time: Date | null;
  end_date_time: Date | null;
}

const StatisticUsageLog = () => {
  const location = useLocation();
  usePageTitle("Log การใช้งาน");

  // State
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [agencyOptions, setAgencyOptions] = useState<{ label: string, value: string }[]>([]);
  const [bhOptions, setBhOptions] = useState<{ label: string, value: string }[]>([]);
  const [bkOptions, setBkOptions] = useState<{ label: string, value: string }[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ label: string, value: string }[]>([]);

  // Data
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [rows, setRows] = useState<LogUsage[]>([]);
  const [selectedData, setSelectedData] = useState<{latitude: number, longitude: number}[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(
    ROWS_PER_PAGE_OPTIONS
  );

  // Form Data
  const [formData, setFormData] = useState<FormData>(() => {
    if (location.state?.fromNavigate && location.state?.filters) {
      return {
        name: location.state.filters.name,
        pid_or_water_mark: location.state.filters.pid,
        agency_id: location.state.filters.agency_id,
        bh_id: location.state.filters.bh_id,
        bk_id: location.state.filters.bk_id,
        org_id: location.state.filters.org_id,
        start_date_time: location.state.filters.start_date,
        end_date_time: location.state.filters.end_date,
      };
    }

    return {
      name: "",
      pid_or_water_mark: "",
      agency_id: "0",
      bh_id: "0",
      bk_id: "0",
      org_id: "0",
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    };
  });

  // Slice
  const { agency, bh, bk, org } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    setAgencyOptions(buildOptions(agency, "ทุกหน่วยงาน"));
    setBhOptions(buildOptions(bh, "ทุกกองบัญชาการ"));
    setBkOptions(buildOptions(bk, "ทุกกองบังคับการ"));
    setOrgOptions(buildOptions(org, "ทุกกองกำกับการ"));
  }, [agency, bh, bk, org]);

  useEffect(() => {
    fetchData();
  }, [formData]);

  const fetchData = useCallback(
    async () => {
      setIsLoading(true);
      const res = await getLogUsage();
      setRows(res.data);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    },
    []
  );

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

  const showLocationDialog = (event: React.MouseEvent<HTMLTableCellElement>, data: LogUsage) => {
    event.preventDefault();
    if (!data.latitude || !data.longitude) return;
    setSelectedData([{ latitude: data.latitude, longitude: data.longitude }, rows.filter((item) => item.latitude !== data.latitude && item.longitude !== data.longitude).map((item) => ({ latitude: item.latitude, longitude: item.longitude }))].flat());
    setLocationDialogOpen(true);
  }

  const handleLocationDialogClose = () => {
    setSelectedData([]);
    setLocationDialogOpen(false);
  }

  const handleClear = () => {
    setFormData({
      name: "",
      pid_or_water_mark: "",
      agency_id: "0",
      bh_id: "0",
      bk_id: "0",
      org_id: "0",
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    });
  }

  const handleExportExcel = async () => {
    await exportExcel({
      sheetName: "Log การใช้งาน",
      fileName: `Log การใช้งาน_${dayjs(formData.start_date_time).format("BBBB-MM-DD")}_${dayjs(formData.end_date_time).format("BBBB-MM-DD")}.xlsx`,
      headers: [
        "ลำดับ",
        "ชื่อ-นามสกุล",
        "เลขบัตรประชาชน",
        "วันที่",
        "IP Address",
        "พิกัด",
        "User Agent",
        "หน่วยงาน",
        "กองบัญชาการ",
        "กองบังคับการ",
        "กองกำกับการ",
      ],
      data: rows,
      mapRow: (data, index) => [
        (page - 1) * rowsPerPage + index + 1,
        `${data.prefix_id || ""}${data.name}`,
        data.pid,
        dayjs(data.date_time).format("DD/MM/BBBB HH:mm:ss"),
        data.ip_address,
        `${data.latitude}, ${data.longitude}`,
        data.user_agent,
        data.agency_name,
        data.bh_name,
        data.bk_name,
        data.org_name,
      ],
    });
  };

  const handleExportPdf = async () => {
    const pdfName = `สถิติการใช้งาน (หน่วยงาน)_${dayjs(formData.start_date_time).format("BBBB-MM-DD")}_${dayjs(formData.end_date_time).format("BBBB-MM-DD")}.pdf`;
    const pdfData: LogUsagePdfData = {
      pid_or_water_mark: formData.pid_or_water_mark || "-",
      name: formData.name || "-",
      agency_id: formData.agency_id,
      agency_name: formData.agency_id === "0" ? "ทั้งหมด" : agencyOptions.find(option => option.value === formData.agency_id)?.label || "-",
      bh_id: formData.bh_id,
      bh_name: formData.bh_id === "0" ? "ทั้งหมด" : bhOptions.find(option => option.value === formData.bh_id)?.label || "-",
      bk_id: formData.bk_id,
      bk_name: formData.bk_id === "0" ? "ทั้งหมด" : bkOptions.find(option => option.value === formData.bk_id)?.label || "-",
      org_id: formData.org_id,
      org_name: formData.org_id === "0" ? "ทั้งหมด" : orgOptions.find(option => option.value === formData.org_id)?.label || "-",
      start_date: dayjs(formData.start_date_time).format("DD/MM/BBBB"),
      end_date: dayjs(formData.end_date_time).format("DD/MM/BBBB"),
      logUsage: rows,
    }
    await downloadStatisticUsageLogPdf(
      pdfData,
      pdfName,
    );
  }

  return (
    <section id='statistic-usage-log'>
      <Box className='p-4 flex flex-col gap-4'>
        {isLoading && <Loading />}
        {/* Main Title */}
        <MainTitle title="Log การใช้งาน" />

        {/* Search Filters */}
        <Box 
          className="grid grid-cols-[repeat(8,minmax(0,1fr))_180px] border border-[#C5C8CB] rounded-[10px] p-4 gap-2 bg-(--secondary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            "& h6": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="pid-or-watermark"
            label={"เลขบัตรประชาชน/รหัสลายน้ำ"}
            placeholder={"เลขบัตรประชาชน, รหัสลายน้ำ"}
            labelFontSize="14px"
            value={formData.pid_or_water_mark}
            onChange={(event) =>
              handleTextChange("pid_or_water_mark", event.target.value)
            }
          />

          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="name"
            label={"ชื่อ-นามสกุล"}
            placeholder={"ชื่อ-นามสกุล"}
            labelFontSize="14px"
            value={formData.name}
            onChange={(event) =>
              handleTextChange("name", event.target.value)
            }
          />

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

          <AutoComplete 
            id="agency-select"
            sx={{ marginTop: "5px"}}
            value={formData.agency_id}
            onChange={(event, value) => handleDropdownChange(event, "agency_id", value)}
            options={agencyOptions}
            label="หน่วยงาน"
            placeholder="กรุณาเลือกหน่วยงาน"
            labelFontSize="14px"
          />

          <AutoComplete 
            id="bh-select"
            sx={{ marginTop: "5px" }}
            value={formData.bh_id}
            onChange={(event, value) => handleDropdownChange(event, "bh_id", value)}
            options={bhOptions}
            label="กองบัญชาการ"
            placeholder="กรุณาเลือกกองบัญชาการ"
            labelFontSize="14px"
            disabled={formData.agency_id === "0"}
          />

          <AutoComplete 
            id="bk-select"
            sx={{ marginTop: "5px" }}
            value={formData.bk_id}
            onChange={(event, value) => handleDropdownChange(event, "bk_id", value)}
            options={bkOptions}
            label="กองบังคับการ"
            placeholder="กรุณาเลือกกองบังคับการ"
            labelFontSize="14px"
            disabled={formData.agency_id === "0" || formData.bh_id === "0"}
          />

          <AutoComplete 
            id="org-select"
            sx={{ marginTop: "5px" }}
            value={formData.org_id}
            onChange={(event, value) => handleDropdownChange(event, "org_id", value)}
            options={orgOptions}
            label="กองกำกับการ"
            placeholder="กรุณาเลือกกองกำกับการ"
            labelFontSize="14px"
            disabled={formData.agency_id === "0" || formData.bh_id === "0" || formData.bk_id === "0"}
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
        />
        <Box sx={{ width: '100%' }}>
          <TableContainer
            component={Paper}
          >
            <Table
              sx={{ minWidth: 650, overflowX: "autp", backgroundColor: "var(--secondary-color)" }}
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
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "100px" }}
                  >
                    {"ลำดับ"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "250px" }}
                  >
                    {"ชื่อ-นามสกุล"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "250px" }}
                  >
                    {"เลขบัตรประชาชน"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"วันที่"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"IP Address"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"พิกัด"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "500px" }}
                  >
                    {"User Agent"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"หน่วยงาน"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"กองบัญชาการ"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"กองบังคับการ"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", minWidth: "200px" }}
                  >
                    {"กองกำกับการ"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--secondary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                  >
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {((page - 1) * rowsPerPage) + index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {`${data.prefix_id || ""}${data.name}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.pid}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {dayjs(data.date_time).format("DD/MM/BBBB HH:mm:ss")}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.ip_address}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: data.latitude && data.longitude ? "var(--hyper-text-color)" : "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        py: 1,
                        px: 1,
                        textDecoration: "underline",
                        cursor: data.latitude && data.longitude ? "pointer" : "default",
                      }}
                      onClick={(event) => showLocationDialog(event, data)}
                    >
                      {`${data.latitude}, ${data.longitude}`}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        py: 1,
                        px: 1,
                      }}
                    >
                      {data.user_agent}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.agency_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.bh_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.bk_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.org_name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Location Usage Dialog */}
        {
          locationDialogOpen && selectedData && (
            <LocationUsage
              open={locationDialogOpen}
              handleClose={handleLocationDialogClose}
              dialogTitle="พิกัดการเข้าใช้งาน"
              data={selectedData}
            />
          )
        }
      </Box>
    </section>
  )
}

export default StatisticUsageLog;
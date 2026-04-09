import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useSelector } from 'react-redux';

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from '@mui/material/MenuItem';
import Menu from "@mui/material/Menu";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Components
import MainTitle from "../components/main-title/MainTitle";
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import AutoComplete from "../components/auto-complete/AutoComplete";
import PieChartComponent from "../components/pie-chart/PieChart";
import LineChartComponent from "../components/line-chart/LineChart";
import Loading from "../components/loading/Loading";

// Icons
import ClearIcon from "../assets/icons/clear.png";
import DownloadIcon from "../assets/icons/download.png";
import ChartIcon from "../assets/icons/chart.png";
import TableIcon from "../assets/icons/table.png";

// Types
import type { OverallPieChart, OverallLineChart } from "../types/chart";
import type { OverallReportType, OverallReportDetail } from "../types/common";
import type { OverallReportPdfData } from "../types/pdf";

// Utils
import { exportExcel } from "../utils/exportData";
import { buildOptions } from "../utils/commonFunctions";

// PDF
import {
  downloadOverallReportPdf,
} from "../pdf/OverallReportPdf";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

// Store
import type { RootState } from "../store/store";

// API
import { 
  getOverallDayReport, 
  getOverallReport,
} from "../features/overall/api/OverallApi";

dayjs.extend(buddhistEra);

interface FormData {
  area_id: string;
  province_id: string;
  project_id: string;
  date_time: Date | null;
  start_date_time: Date | null;
  end_date_time: Date | null;
  month_year: Date | null;
}

const OverallReport = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  usePageTitle("รายงานภาพรวมของระบบ");

  // State
  const [reportRange, setReportRange] = useState<"day" | "week" | "month">("day");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data
  const [dayReportData, setDayReportData] = useState<OverallReportType[]>([]);
  const [weekReportData, setWeekReportData] = useState<OverallReportType[]>([]);
  const [monthReportData, setMonthReportData] = useState<OverallReportType[]>([]);
  const [dayReport, setDayReport] = useState<OverallPieChart[]>([]);
  const [weekReport, setWeekReport] = useState<OverallLineChart[]>([]);
  const [monthReport, setMothReport] = useState<OverallLineChart[]>([]);
  const [excelData, setExcelData] = useState<OverallReportDetail[]>([]);

  // Options
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string, value: string }[]>([]);
  const [areaOptions, setAreaOptions] = useState<{ label: string, value: string }[]>([]);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    area_id: "0",
    province_id: "0",
    project_id: "0",
    date_time: dayjs().toDate(),
    start_date_time: dayjs().subtract(6, "day").toDate(),
    end_date_time: dayjs().toDate(),
    month_year: dayjs().toDate(),
  });

  // Slice
  const { area, province, project } = useSelector((state: RootState) => state.dropdown);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (reportRange === "day") {
          const res = await getOverallDayReport();
          const data = res.data;

          setDayReportData(data);

          const totalData = data.find(
            (report: any) =>
              report.police_division?.toLowerCase() === "total"
          );

          const reportData = [
            {
              name: "normal",
              name_th: "สถานะปกติ",
              value: totalData?.normal ?? 0,
              percent_value: totalData?.normal_percent ?? 0,
              fill: "var(--status-device-normal)",
            },
            {
              name: "device",
              name_th: "อุปกรณ์ขัดข้อง",
              value: totalData?.device ?? 0,
              percent_value: totalData?.device_percent ?? 0,
              fill: "var(--status-device-outage)",
            },
            {
              name: "network",
              name_th: "เครือข่ายขัดข้อง",
              value: totalData?.network ?? 0,
              percent_value: totalData?.network_percent ?? 0,
              fill: "var(--status-network-outage)",
            },
            {
              name: "disable",
              name_th: "อุปกรณ์ปิดใช้งาน",
              value: totalData?.disable ?? 0,
              percent_value: totalData?.disable_percent ?? 0,
              fill: "var(--status-device-disable)",
            },
          ];

          setDayReport(reportData);
        }

        if (reportRange === "week") {
          const res = await getOverallReport("week");
          const rows = res.data.rows;

          setWeekReportData(rows);
          setWeekReport(res.data.charts);
        }

        if (reportRange === "month") {
          const res = await getOverallReport("month");
          const rows = res.data.rows;

          setMonthReportData(rows);
          setMothReport(res.data.charts);
        }
      } 
      catch (error) {
        console.error("Fetch overall report error:", error);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    };

    fetchData();
  }, [reportRange]);

  useEffect(() => {
    setAreaOptions(buildOptions(area, "ทุกพื้นที่"));
    setProvinceOptions(buildOptions(province, "ทุกจังหวัด"));
    setProjectOptions(buildOptions(project, "ทุกโครงการ"));
  }, [area, province, project]);

  const handleStateChange = (value: "day" | "week" | "month") => {
    setReportRange(value);
  };

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    if (!date) return;

    if (reportRange === "week") {
      if (key === "start_date_time") {
        const start = dayjs(date);
        const end = start.add(6, "day");

        setFormData((prev) => ({
          ...prev,
          start_date_time: start.toDate(),
          end_date_time: end.toDate(),
        }));
        return;
      }

      if (key === "end_date_time") {
        const end = dayjs(date);
        const start = end.subtract(6, "day");

        setFormData((prev) => ({
          ...prev,
          start_date_time: start.toDate(),
          end_date_time: end.toDate(),
        }));
        return;
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
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
      area_id: "0",
    province_id: "0",
    project_id: "0",
      date_time: dayjs().toDate(),
      start_date_time: dayjs().subtract(6, "day").toDate(),
      end_date_time: dayjs().toDate(),
      month_year: dayjs().toDate(),
    });
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleExport = (type: "pdf" | "excel") => {
    handleCloseMenu();
    if (type === "pdf") {
      handleExportPdf();
    }
    else if (type === "excel") {
      handleExportExcel();
    }
  }

  const handleExportPdf = async () => {
    const name = reportRange === "day" ? "รายงานรายวัน" : reportRange === "week" ? "รายงานรายสัปดาห์" : "รายงานรายเดือน";
    const dateName = reportRange === "week" ? `${dayjs(formData.start_date_time).format("BBBB-MM-DD")}_${dayjs(formData.end_date_time).format("BBBB-MM-DD")}` : 
                `${dayjs(formData.date_time).format("BBBB-MM-DD")}`
    const date = reportRange === "week" ? `${dayjs(formData.start_date_time).format("DD/MM/BBBB")} - ${dayjs(formData.end_date_time).format("DD/MM/BBBB")}` : 
                `${dayjs(formData.date_time).format("DD/MM/BBBB")}`
    const pdfName = `${name}_${dateName}.pdf`;
    const pdfData: OverallReportPdfData = {
      title: `รายงานประจำ${reportRange === "day" ? "วัน" : reportRange === "week" ? "สัปดาห์" : "เดือน"}และจุดตรวจที่มีปัญหา`,
      date: date,
      area: formData.area_id === "0" ? "ทั้งหมด" : areaOptions.find((item) => item.value === formData.area_id)?.label ?? "-",
      province: formData.province_id === "0" ? "ทั้งหมด" : provinceOptions.find((item) => item.value === formData.province_id)?.label ?? "-",
      project: formData.project_id === "0" ? "ทั้งหมด" : projectOptions.find((item) => item.value === formData.project_id)?.label ?? "-",
      overallReport: reportRange === "day" ? dayReportData : reportRange === "week" ? weekReportData : monthReportData,
      overallReportDetail: excelData,
    }
    await downloadOverallReportPdf(
      pdfData,
      pdfName,
    );
  }

  const handleExportExcel = async () => {
    const sheetName = reportRange === "day" ? "รายงานรายวัน" : reportRange === "week" ? "รายงานรายสัปดาห์" : "รายงานรายเดือน";
    const date = reportRange === "week" ? `${dayjs(formData.start_date_time).format("BBBB-MM-DD")}_${dayjs(formData.end_date_time).format("BBBB-MM-DD")}` : 
                `${dayjs(formData.date_time).format("BBBB-MM-DD")}`
    await exportExcel({
      sheetName: sheetName,
      fileName: `${sheetName}_${date}.xlsx`,
      headers: [
        "ลำดับ",
        "จุดตรวจ",
        "ด่านตรวจ",
        "สถานีตำรวจ",
        "พื้นที่",
        "จังหวัด",
        "โครงการ",
        "สถานะ",
        "วันที่มีปัญหา",
        "%ปัญหา",
        "หมายเหตุ",
      ],
      data: excelData,
      mapRow: (data, index) => [
        index + 1,
        data.checkpoint_name,
        data.camera_name,
        data.station_name,
        data.area_name,
        data.province_name,
        data.project,
        data.status_id === 1 ? "เปิดใช้งาน" : "ปิดใช้งาน",
        data.date_count_error,
        data.date_count_error_percent.toFixed(1),
        data.remark,
      ],
      columnStyles: {
        1: { alignment: { horizontal: "center" } },
        7: { alignment: { horizontal: "center" } },
        8: { alignment: { horizontal: "center" } },
        9: { alignment: { horizontal: "center" } },
        10: { alignment: { horizontal: "center" } },
      },
    });
  };

  return (
    <section id='overall-report'>
      <Box className='p-4 flex flex-col gap-4'>
        {isLoading && <Loading />}
        {/* Main Title */}
        <MainTitle title="รายงานภาพรวมของระบบ" />

        {/* Search Filters */}
        <Box className="flex flex-col gap-4 bg-(--secondary-color) p-4">
          <Box className="flex gap-4">
            <Button
              variant="contained"
              sx={{
                width: 200,
                height: 38,
                backgroundColor: reportRange === "day" ? "var(--primary-color)" : "var(--secondary-color)",
                color: reportRange === "day" ? "var(--secondary-color)" : "var(--primary-color)",
                border: reportRange === "day" ? "none" : "1px solid var(--primary-color)",
                "&:hover": {
                  backgroundColor: reportRange === "day" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                },
                fontWeight: 700,
              }}
              onClick={() => handleStateChange("day")}
            >
              รายงานรายวัน
            </Button>
            <Button
              variant="contained"
              sx={{
                width: 200,
                height: 38,
                backgroundColor: reportRange === "week" ? "var(--primary-color)" : "var(--secondary-color)",
                color: reportRange === "week" ? "var(--secondary-color)" : "var(--primary-color)",
                border: reportRange === "week" ? "none" : "1px solid var(--primary-color)",
                "&:hover": {
                  backgroundColor: reportRange === "week" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                },
                fontWeight: 700,
              }}
              onClick={() => handleStateChange("week")}
            >
              รายงานรายสัปดาห์
            </Button>
            <Button
              variant="contained"
              sx={{
                width: 200,
                height: 38,
                backgroundColor: reportRange === "month" ? "var(--primary-color)" : "var(--secondary-color)",
                color: reportRange === "month" ? "var(--secondary-color)" : "var(--primary-color)",
                border: reportRange === "month" ? "none" : "1px solid var(--primary-color)",
                "&:hover": {
                  backgroundColor: reportRange === "month" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                },
                fontWeight: 700,
              }}
              onClick={() => handleStateChange("month")}
            >
              รายงานรายเดือน
            </Button>
          </Box>
          <Box 
            className="border border-[#C5C8CB] rounded-[10px] p-4 bg-(--secondary-color)"
            sx={{
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
              "& h6": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              display: "grid",
              gap: 2,
              gridTemplateColumns:
                reportRange === 'week'
                  ? 'repeat(5, minmax(0, 1fr)) 130px'
                  : 'repeat(4, minmax(0, 1fr)) 130px',
            }}
          >
            {
              reportRange === "day" && (
                <DatePickerBuddhist
                  value={formData.date_time}
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
                  id="date-time"
                  onChange={(value) =>
                    handleDateTimeChange("date_time", value)
                  }
                  label={"วันที่"}
                  labelFontSize="14px"
                  maxDate={dayjs()}
                />
              )
            }

            {
              reportRange === "week" && (
                <>
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
                    label={"ตั้งแต่วันที่"}
                    labelFontSize="14px"
                    maxDate={dayjs()}
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
                    id="start-date-time"
                    onChange={(value) =>
                      handleDateTimeChange("end_date_time", value)
                    }
                    label={"ถึงวันที่"}
                    labelFontSize="14px"
                    maxDate={dayjs()}
                  />
                </>
              )
            }

            {
              reportRange === "month" && (
                <DatePickerBuddhist
                  value={formData.month_year}
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
                  id="date-time"
                  onChange={(value) =>
                    handleDateTimeChange("month_year", value)
                  }
                  label={"เดือน"}
                  labelFontSize="14px"
                  views={["year", "month"]}
                  openTo="month"
                  format='MMMM YYYY'
                  maxDate={dayjs()}
                />
              )
            }

            <AutoComplete 
              id="area-select"
              sx={{ marginTop: "5px" }}
              value={formData.area_id}
              onChange={(event, value) => handleDropdownChange(event, "area_id", value)}
              options={areaOptions}
              label="พื้นที่"
              placeholder="เลือกพื้นที่"
              labelFontSize="14px"
            />

            <AutoComplete 
              id="province-select"
              sx={{ marginTop: "5px" }}
              value={formData.province_id}
              onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
              options={provinceOptions}
              label="จังหวัด"
              placeholder="เลือกจังหวัด"
              labelFontSize="14px"
            />

            <AutoComplete 
              id="project-select"
              sx={{ marginTop: "5px" }}
              value={formData.project_id}
              onChange={(event, value) => handleDropdownChange(event, "project_id", value)}
              options={projectOptions}
              label="โครงการ"
              placeholder="เลือกโครงการ"
              labelFontSize="14px"
            />

            <Box className="flex gap-2 items-end">
              <Button 
                variant="contained" 
                startIcon={<img src={ClearIcon} alt="Clear" className="h-6 w-6" />} 
                sx={{ 
                  backgroundColor: "var(--primary-color)", 
                  fontSize: "14px", 
                  width: "90px",
                  height: "40px",
                }}
                onClick={handleClear}
              >
                ล้าง
              </Button>
              <IconButton 
                sx={{ border: "1px solid var(--primary-color)", width: "40px", height: "40px", borderRadius: "5px" }}
                onClick={handleOpenMenu}
              >
                <img src={DownloadIcon} alt="Download" className="h-5 w-5" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    border: "1px solid var(--primary-color)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  },
                  "& .MuiMenu-list": {
                    p: 0,
                  },
                  "& .MuiMenuItem-root": {
                    px: "20px",
                    py: "8px",
                    "&:not(:last-of-type)": {
                      borderBottom: "1px solid var(--primary-color)",
                    },
                  },
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: 20,
                  },
                }}
              >
                <MenuItem onClick={() => handleExport("pdf")}>
                  <ListItemText primary="PDF" />
                </MenuItem>

                <MenuItem onClick={() => handleExport("excel")}>
                  <ListItemText primary="Excel" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        <Box className="grid grid-cols-2 gap-4">
          {/* Chart */}
          <Box className="flex flex-col gap-4 bg-(--secondary-color) p-4">
            <Box className="flex gap-2">
              <img src={ChartIcon} alt="Chart" className="w-6 h-6" />
              <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "semi-bold", color: "var(--primary-color)" }}>
                {
                  reportRange === "day"
                    ? `สถานะประจำวันที่ ${dayjs(formData.date_time).format("DD MMMM BBBB")}`
                    : reportRange === "week"
                      ? `สถานะประจำสัปดาห์วันที่ ${dayjs(formData.start_date_time).format("D")}-${dayjs(formData.end_date_time).format("D MMMM BBBB")}`
                      : `สถานะประจำเดือน${dayjs(formData.month_year).format("MMMM BBBB")}`
                }
              </Typography>
            </Box>
            {
              reportRange === "day" && (
                <PieChartComponent
                  data={dayReport}
                />
              )
            }
            {
              reportRange === "week" && (
                <LineChartComponent
                  data={weekReport}
                />
              )
            }
            {
              reportRange === "month" && (
                <LineChartComponent
                  data={monthReport}
                  isMonth={true}
                />
              )
            }
          </Box>
          {/* Table */}
          <Box className="flex flex-col gap-4 bg-(--secondary-color) p-4">
            <Box className="flex gap-2">
              <img src={TableIcon} alt="Table" className="w-6 h-6" />
              <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "semi-bold", color: "var(--primary-color)" }}>
                {
                  reportRange === "day"
                    ? `รายงานประสิทธิภาพเชิงพื้นที่ประจำวันที่ ${dayjs(formData.date_time).format("DD MMMM BBBB")}`
                    : reportRange === "week"
                      ? `รายงานประสิทธิภาพเชิงพื้นที่ (รายสัปดาห์) วันที่ ${dayjs(formData.start_date_time).format("D")}-${dayjs(formData.end_date_time).format("D MMMM BBBB")}`
                      : `รายงานประสิทธิภาพเชิงพื้นที่ (รายเดือน) ${dayjs(formData.month_year).format("MMMM BBBB")}`
                }
              </Typography>
            </Box>
            <TableContainer
              component={Paper}
              className="mt-2"
              sx={{
                backgroundColor: "transparent",
                overflow: "auto"
              }}
            >
              <Table
                stickyHeader
              >
                {/* ================= HEADER ================= */}
                <TableHead>
                  <TableRow
                    sx={{
                      height: 50,
                      "& .MuiTableCell-head": {
                        color: "white",
                        backgroundColor: "var(--primary-color)",
                      },
                      "& th": {
                        color: "#FFFFFF",
                        border: "1px solid #DBDCDE",
                        padding: "6px 8px",
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      พื้นที่
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      จุดตรวจทั้งหมด
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      สถานะปกติ
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      อุปกรณ์ขัดข้อง
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      เครือข่ายขัดข้อง
                    </TableCell>
                    <TableCell align="center" sx={{ width: "16.7%", fontWeight: 600 }}>
                      ปิดการใช้งาน
                    </TableCell>
                  </TableRow>
                </TableHead>
                {/* ================= BODY ================= */}
                <TableBody>
                  {
                    (reportRange === "day" ? dayReportData : 
                      reportRange === "week" ? weekReportData : monthReportData
                    )?.map((data, index) => {
                      const isTotal = data.police_division?.toLowerCase() === "total";

                      const cellStyle = {
                        color: "var(--text-chart-table-color)",
                        fontSize: "16px",
                        backgroundColor: isTotal ? "#F0F2F5" : "",
                      };

                      const renderCell = (
                        colorClass: string,
                        value: number,
                        percent?: number
                      ) => (
                        <Box className="flex gap-2 items-center justify-start px-3">
                          <Box className={`w-4 h-4 ${colorClass} rounded-full`} />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "16px", color: "var(--primary-color)", p: 0 }}
                          >
                            {value.toLocaleString()}
                            {percent !== undefined && (
                              <span className="text-(--percent-text-color) text-[12px] ml-1">
                                ({percent.toFixed(1)}%)
                              </span>
                            )}
                          </Typography>
                        </Box>
                      );

                      return (
                        <TableRow
                          key={index}
                          sx={{
                            "& td": {
                              border: "1px solid #DBDCDE",
                              padding: "8.5px 8px",
                              color: "#124692",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              ...cellStyle,
                              fontWeight: 600,
                              fontSize: "14px",
                            }}
                          >
                            {data.police_division_name}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell("bg-(--status-all)", data.total)}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-device-normal)",
                              data.normal,
                              data.normal_percent
                            )}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-device-outage)",
                              data.device,
                              data.device_percent
                            )}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-network-outage)",
                              data.network,
                              data.network_percent
                            )}
                          </TableCell>

                          <TableCell sx={cellStyle}>
                            {renderCell(
                              "bg-(--status-device-disable)",
                              data.disable,
                              data.disable_percent
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </section>
  )
}

export default OverallReport;
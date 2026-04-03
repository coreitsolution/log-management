import React, { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs';
import buddhistEra from "dayjs/plugin/buddhistEra";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material';

// Components
import MainTitle from "../components/main-title/MainTitle";
import AutoComplete from "../components/auto-complete/AutoComplete";
import AgencyBarChart from '../components/charts/AgencyBarChart';
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationBelowTableComponent from "../components/pagination/PaginationBelowTable";
import TopUsersDisplaySetting from '../components/top-users-display-setting/TopUsersDisplaySetting';

// Icons
import SettingIcon from "../assets/icons/setting.png";
import SettingWhiteIcon from "../assets/icons/setting-white.png";

// API
import { getTopUsersChart } from "../features/usage-chart/api/UsageChartApi";

// Types
import type { Option, TopUsersType } from "../types/common";

// Utils
import { formatNumber } from "../utils/commonFunctions";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

dayjs.extend(buddhistEra);

type Props = {}

const ChartTopUsers = (props: Props) => {

  // State
  const [policeState, setPoliceState] = useState<"internal" | "external">("internal");
  const [displaySettingOpen, setDisplaySettingOpen] = useState<boolean>(false);

  // Data
  const [monthYearSelect, setMonthYearSelect] = useState<string>("");
  const [topUsersData, setTopUsersData] = useState<TopUsersType[]>([]);
  const [topInternalValue, setTopInternalValue] = useState<number>(5000);
  const [topExternalValue, setTopExternalValue] = useState<number>(3000);

  // Options
  const [monthYearOptions, setMonthYearOptions] = useState<Option[]>([]);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageInput, setPageInput] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );
  const [rowsPerPageOptions] = useState(ROWS_PER_PAGE_OPTIONS);

  useEffect(() => {
    const currentDate = dayjs();

    const monthYearData = Array.from({ length: 12 }, (_, index) => {
      const month = currentDate.subtract(index, "month");

      return {
        label: month.format("MMMM BBBB"),
        value: month.startOf("month").toISOString(),
      };
    });

    setMonthYearOptions(monthYearData);
    setMonthYearSelect(monthYearData[0].value);
  }, []);

  useEffect(() => {
    if (!monthYearSelect) return;

    fetchData(monthYearSelect, policeState);
  }, [monthYearSelect, policeState]);

  const fetchData = useCallback(
    async (monthYear: string, policeState: "internal" | "external") => {
      const res = await getTopUsersChart(monthYear, policeState);
      if (!res) return;
      setTopUsersData(res.results);
    },
    []
  );

  const handleDateTimeChange = (date: Date | null) => {
    setMonthYearSelect(dayjs(date).format("YYYY-MM-DD"));
  };

  const handleStateChange = (value: "internal" | "external") => {
    setPoliceState(value);
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value)
    setRowsPerPage(limit);
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      setPage(pageInput);
    }
  };

  const handlePageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');

    if (cleaned) {
      const numberInput = Number(cleaned);
      if (numberInput > 0 && numberInput <= totalPages) {
        setPageInput(numberInput);
      }
    }
    else if (cleaned === "") {
      setPageInput(1);
    }
    return cleaned;
  }

  const handleDisplaySettingChange = (topInternal: number, topExternal: number) => {
    setDisplaySettingOpen(false);
    setTopInternalValue(topInternal);
    setTopExternalValue(topExternal);
  }

  return (
    <section id='chart-external-police' className='h-full'>
      <Box className='p-4 flex flex-col gap-4 h-full'>
        {/* Main Title */}
        <MainTitle title="ผู้ใช้งานสูงสุด (ย้อนหลัง 3 เดือน) " />

        {/* Chart */}
        <Box 
          className="w-full bg-(--secondary-color) p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(0,0,0,0.1)"
          }}
        >
          <Box className="flex flex-col gap-2">
            <Box className='flex justify-between gap-2'>
              <Box className='flex gap-2 w-50'>
                <DatePickerBuddhist
                  value={monthYearSelect ? dayjs(monthYearSelect).toDate() : null}
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
                  id="month-year"
                  onChange={(value) =>
                    handleDateTimeChange(value)
                  }

                  label={"เดือนหลัก"}
                  labelFontSize="14px"
                  views={["year", "month"]}
                  openTo="month"
                  format='MMMM YYYY'
                  maxDate={dayjs()}
                />
              </Box>
              <Box className="-mt-1">
                <IconButton 
                  sx={{
                    backgroundColor: displaySettingOpen ? "var(--primary-color)" : "var(--secondary-color)",
                    border: "1px solid var(--primary-color)",
                    "&:hover": {
                      backgroundColor: "var(--range-button-color-hover)",
                    },
                    borderRadius: "5px",
                    padding: "5px",
                  }}
                  onClick={() => setDisplaySettingOpen(true)}
                >
                  <img src={displaySettingOpen ? SettingWhiteIcon : SettingIcon} alt="Setting" className='w-5 h-5' />
                </IconButton>
              </Box>
            </Box>
            <Box className='flex justify-between mt-5'>
              <Box className='flex gap-3 items-center'>
                <Button
                  variant="contained"
                  sx={{
                    width: 170,
                    height: 40,
                    backgroundColor: policeState === "internal" ? "var(--primary-color)" : "var(--secondary-color)",
                    color: policeState === "internal" ? "var(--secondary-color)" : "var(--primary-color)",
                    border: policeState === "internal" ? "none" : "1px solid var(--primary-color)",
                    "&:hover": {
                      backgroundColor: policeState === "internal" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                    },
                    fontWeight: 700,
                  }}
                  onClick={() => handleStateChange("internal")}
                >
                  หน่วยงานภายใน ตร.
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    width: 170,
                    height: 40,
                    backgroundColor: policeState === "external" ? "var(--primary-color)" : "var(--secondary-color)",
                    color: policeState === "external" ? "var(--secondary-color)" : "var(--primary-color)",
                    border: policeState === "external" ? "none" : "1px solid var(--primary-color)",
                    "&:hover": {
                      backgroundColor: policeState === "external" ? "var(--primary-color)" : "var(--range-button-color-hover)",
                    },
                    fontWeight: 700,
                  }}
                  onClick={() => handleStateChange("external")}
                >
                  หน่วยงานภายนอก ตร.
                </Button>
              </Box>
              <Box className='flex items-end'>
                <Typography className="text-(--primary-color)" sx={{ fontSize: "14px" }}>
                  จำนวนการใช้งานมากกว่า :{" "}
                  <span className="font-bold">{formatNumber(policeState === "internal" ? topInternalValue : topExternalValue)}</span>{" "}
                  ครั้ง
                </Typography>
              </Box>
            </Box>

            {/* Table */}
            <TableContainer
              component={Paper}
              className="mt-3 flex-1"
              sx={{
                backgroundColor: "transparent",
                overflow: "auto"
              }}
            >
              <Table
                size="small"
                sx={{ minWidth: 650, backgroundColor: "white" }}
              >
                {/* ================= HEADER ================= */}
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#0C5D9F",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      height: 40,
                      "& th": {
                        color: "#FFFFFF",
                        border: "1px solid #DBDCDE",
                        padding: "6px 8px",
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ width: "3%", fontWeight: 700 }}>
                      ลำดับที่
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      เลขบัตร
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      ชื่อ
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      เบอร์โทร
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%", fontWeight: 700 }}>
                      หน่วยงาน
                    </TableCell>

                    {topUsersData[0]?.usageData
                    .sort((a, b) =>
                      dayjs(a.usageMonthYear).valueOf() -
                      dayjs(b.usageMonthYear).valueOf()
                    )
                    .map((usage, index) => (
                      <TableCell
                        key={`header-${index}`}
                        align="center"
                        sx={{ width: "8%", fontWeight: 700 }}
                      >
                        {dayjs(usage.usageMonthYear)
                          .locale("th")
                          .format("MMMM BBBB")}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                {/* ================= BODY ================= */}
                <TableBody>
                  {topUsersData.map((item, index) => {
                    
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          "& td": {
                            border: "1px solid #DBDCDE",
                            padding: "6px 8px",
                            color: "#124692",
                          },
                        }}
                      >
                        <TableCell align="center">
                          {index + 1}
                        </TableCell>

                        <TableCell align="center">
                          {item.nation_number}
                        </TableCell>

                        <TableCell align="center">
                          {`${item.prename_id}${item.fullname}`}
                        </TableCell>

                        <TableCell align="center">
                          {item.phone}
                        </TableCell>

                        <TableCell align="center">
                          {item.ad_ou}
                        </TableCell>

                        {item.usageData
                        .sort((a, b) =>
                          dayjs(a.usageMonthYear).valueOf() -
                          dayjs(b.usageMonthYear).valueOf()
                        )
                        .map((usage, usageIndex) => (
                          <TableCell
                            key={`row-${index}-${usageIndex}`}
                            sx={{
                              backgroundColor: dayjs(monthYearSelect).format("YYYY-MM") === usage.usageMonthYear ? "#F0F2F5" : "white",
                              fontWeight: dayjs(monthYearSelect).format("YYYY-MM") === usage.usageMonthYear ? "bold" : "normal",
                            }}
                            align="center"
                          >
                            {formatNumber(usage.usageCount)}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Box className={`${topUsersData.length > 0 ? "flex" : "hidden"} items-center justify-between py-3 pl-1 mt-auto`}>
          <PaginationBelowTableComponent 
            page={page} 
            onChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            handleRowsPerPageChange={handleRowsPerPageChange}
            totalPages={totalPages}
            pageInput={pageInput.toString()}
            handlePageInputKeyDown={handlePageInputKeyDown}
            handlePageInputChange={handlePageInputChange}
          />
        </Box>

        {/* Display Setting */}
        {
          displaySettingOpen && (
            <TopUsersDisplaySetting
              open={displaySettingOpen}
              handleClose={() => setDisplaySettingOpen(false)}
              dialogTitle='ตั้งค่าการแสดงผล'
              onSave={handleDisplaySettingChange}
            />
          )
        }
      </Box>
    </section>
  )
};

export default ChartTopUsers;
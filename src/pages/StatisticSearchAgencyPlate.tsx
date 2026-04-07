import { useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import buddhistEra from "dayjs/plugin/buddhistEra";

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
import DetailsDialog from "../components/details-dialog/DetailsDialog";
import TextBox from "../components/text-box/TextBox";

// Icons
import ClearIcon from "../assets/icons/clear.png";
import ExportExcelIcon from "../assets/icons/export-excel.png";
import ExportPdfIcon from "../assets/icons/export-pdf.png";
import InformationIcon from "../assets/icons/information.png";

// Constants
import { ROWS_PER_PAGE_OPTIONS } from "../constants/dropdown";

// Types
import type { AgencyUsage } from "../types/common";
import type { SearchAgencyPlatePdfData } from "../types/pdf";

// Utils
import { formatNumber } from "../utils/commonFunctions";
import { exportExcel } from "../utils/exportData";

// PDF
import {
  downloadStatisticSearchAgencyPlatePdf,
  generateStatisticSearchAgencyPlatePdfBlob,
} from "../pdf/StatisticSearchAgencyPlatePdf";

// Mock Data
import { mockAgencyUsage } from "../mocks/mockAgencyUsage";

dayjs.extend(buddhistEra);

interface FormData {
  plate_group: string;
  plate_number: string;
  province_id: number;
  agency_id: number;
  bh_id: number;
  bk_id: number;
  start_date_time: Date | null;
  end_date_time: Date | null;
}

type Props = {}

const StatisticSearchAgencyPlate = (props: Props) => {
  const navigate = useNavigate();

  // State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Options
  const [agencyOptions, setAgencyOptions] = useState<{ label: string, value: number }[]>([]);
  const [bhOptions, setBhOptions] = useState<{ label: string, value: number }[]>([]);
  const [bkOptions, setBkOptions] = useState<{ label: string, value: number }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string, value: number }[]>([]);

  // Data
  const [totalItems, setTotalItems] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [rows, setRows] = useState<AgencyUsage[]>(mockAgencyUsage);
  const [selectedData, setSelectedData] = useState<AgencyUsage | null>(null);

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
    plate_group: "",
    plate_number: "",
    province_id: 0,
    agency_id: 0,
    bh_id: 0,
    bk_id: 0,
    start_date_time: dayjs().toDate(),
    end_date_time: dayjs().toDate(),
  });

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

  const showDetailDialog = (data: AgencyUsage) => {
    setSelectedData(data);
    setDetailDialogOpen(true);
  }

  const handleDetailsDialogClose = () => {
    setSelectedData(null);
    setDetailDialogOpen(false);
  }

  const handleClear = () => {
    setFormData({
      plate_group: "",
      plate_number: "",
      province_id: 0,
      agency_id: 0,
      bh_id: 0,
      bk_id: 0,
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    });
  }

  const handleExportExcel = async () => {
    await exportExcel({
      sheetName: "สถิติการค้นป้ายทะเบียน (หน่วยงาน)",
      fileName: `สถิติการค้นป้ายทะเบียน (หน่วยงาน)_${dayjs(formData.start_date_time).format("BBBB-MM-DD")}_${dayjs(formData.end_date_time).format("BBBB-MM-DD")}.xlsx`,
      headers: [
        "ลำดับ",
        "จำนวน",
        "หน่วยงาน",
        "กองบัญชาการ",
        "กองบังคับการ",
        "กองกำกับการ",
      ],
      data: rows,
      mapRow: (data, index) => [
        (page - 1) * rowsPerPage + index + 1,
        Number(data.usage_count),
        data.agency_name,
        data.bh_name,
        data.bk_name,
        data.org_name,
      ],
      columnStyles: {
        2: { alignment: { horizontal: "center" } },
      },
    });
  };

  const handleExportPdf = async () => {
    const pdfName = `สถิติการค้นป้ายทะเบียน (หน่วยงาน)_${dayjs(formData.start_date_time).format("BBBB-MM-DD")}_${dayjs(formData.end_date_time).format("BBBB-MM-DD")}.pdf`;
    const pdfData: SearchAgencyPlatePdfData = {
      agency_id: formData.agency_id,
      agency_name: formData.agency_id === 0 ? "ทั้งหมด" : agencyOptions.find(option => option.value === formData.agency_id)?.label || "-",
      bh_id: formData.bh_id,
      bh_name: formData.bh_id === 0 ? "ทั้งหมด" : bhOptions.find(option => option.value === formData.bh_id)?.label || "-",
      bk_id: formData.bk_id,
      bk_name: formData.bk_id === 0 ? "ทั้งหมด" : bkOptions.find(option => option.value === formData.bk_id)?.label || "-",
      plate_group: formData.plate_group,
      plate_number: formData.plate_number,
      province_id: formData.province_id,
      province_name: provinceOptions.find(option => option.value === formData.province_id)?.label || "",
      start_date: dayjs(formData.start_date_time).format("DD/MM/BBBB"),
      end_date: dayjs(formData.end_date_time).format("DD/MM/BBBB"),
      agencyPlate: rows,
    }
    await downloadStatisticSearchAgencyPlatePdf(
      pdfData,
      pdfName,
    );
  };

  const navigateToSearchPersonPlate = async () => {
    navigate("/statistic-search-person-plate", {
      state: {
        fromNavigate: true,
        filters: {
          agency_id: selectedData?.agency_id ?? 0,
          bh_id: selectedData?.bh_id ?? 0,
          bk_id: selectedData?.bk_id ?? 0,
          org_id: selectedData?.org_id ?? 0,
          start_date: formData.start_date_time,
          end_date: formData.end_date_time,
        }
      }
    });
    setSelectedData(null);
    setDetailDialogOpen(false);
  }

  return (
    <section id='statistic-search-agency-plate'>
      <Box className='p-4 flex flex-col gap-4'>
        {/* Main Title */}
        <MainTitle title="สถิติการค้นป้ายทะเบียน (หน่วยงาน)" />

        {/* Search Filters */}
        <Box 
          className="grid grid-cols-8 border border-[#C5C8CB] rounded-[10px] p-4 gap-2 bg-(--secondary-color)"
          sx={{
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
          }}
        >
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
          />

          <Box className="grid grid-cols-2 gap-2">
            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="plate-group"
              label={"หมวดอักษร"}
              placeholder={"หมวดอักษร"}
              labelFontSize="14px"
              value={formData.plate_group}
              onChange={(event) =>
                handleTextChange("plate_group", event.target.value)
              }
            />

            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="plate-number"
              label={"เลขทะเบียน"}
              placeholder={"เลขทะเบียน"}
              labelFontSize="14px"
              value={formData.plate_number}
              onChange={(event) =>
                handleTextChange("plate_number", event.target.value)
              }
            />
          </Box>

          <AutoComplete 
            id="province-select"
            sx={{ marginTop: "5px" }}
            value={formData.province_id}
            onChange={(event, value) => handleDropdownChange(event, "province_id", value)}
            options={provinceOptions}
            label="หมวดจังหวัด"
            placeholder="กรุณาเลือกหมวดจังหวัด"
            labelFontSize="14px"
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
            error={!!errors.start_date_time}
            register={register("start_date_time", {
              required: true,
            })}
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
            error={!!errors.end_date_time}
            register={register("end_date_time", {
              required: true,
            })}
            label={"วันสิ้นสุด"}
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
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "2%" }}
                  >
                    {"ลำดับ"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {"จำนวน"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {"หน่วยงาน"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {"กองบัญชาการ"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {"กองบังคับการ"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#FFFFFF", width: "10%" }}
                  >
                    {"กองกำกับการ"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "var(--secondary-color)" }}>
                {rows.map((data, index) => (
                  <TableRow
                    key={index}
                    onClick={() => {
                      showDetailDialog(data);
                    }}
                  >
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                        textAlign: "center",
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
                      }}
                    >
                      {formatNumber(data.usage_count)}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.agency_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.bh_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
                        color: "var(--table-text-color)",
                        borderBottom: "1px solid var(--table-border-color)",
                      }}
                    >
                      {data.bk_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: selectedData?.id === data.id ? "var(--highlight-bg-color)" : "var(--secondary-color)",
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

        {/* Detail Dialog */}
        {
          detailDialogOpen && (
            <DetailsDialog
              open={detailDialogOpen}
              handleClose={handleDetailsDialogClose}
              dialogTitle="สถิติการค้นป้ายทะเบียน (หน่วยงาน)"
            >
              <Box className="flex flex-col gap-3 items-center px-4 pt-4">
                <img src={InformationIcon} alt="Information" className="h-15 w-15" />
                <Box className="w-full text-(--text-color) grid grid-cols-[110px_10px_1fr]">
                  <p>จำนวน (ครั้ง)</p>
                  <p>:</p>
                  <p>{formatNumber(selectedData?.usage_count ?? 0)}</p>

                  <p>หน่วยงาน</p>
                  <p>:</p>
                  <p>{selectedData?.agency_name}</p>

                  <p>กองบัญชาการ</p>
                  <p>:</p>
                  <p>{selectedData?.bh_name}</p>

                  <p>กองบังคับการ</p>
                  <p>:</p>
                  <p>{selectedData?.bk_name}</p>

                  <p>กองกำกับการ</p>
                  <p>:</p>
                  <p>{selectedData?.org_name}</p>
                </Box>
                <Button
                  variant="contained"
                  sx={{ 
                    backgroundColor: "var(--primary-color)", 
                    fontSize: "13px", 
                    width: "120px", 
                    py: 0.35, 
                    borderRadius: "5px",
                    mt: 1,
                  }}
                  onClick={navigateToSearchPersonPlate}
                >
                  รายละเอียด
                </Button>
              </Box>
            </DetailsDialog>
          )
        }
      </Box>
    </section>
  )
}

export default StatisticSearchAgencyPlate;
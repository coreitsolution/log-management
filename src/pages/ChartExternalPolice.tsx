import { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs';
import buddhistEra from "dayjs/plugin/buddhistEra";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Components
import MainTitle from "../components/main-title/MainTitle";
import AgencyBarChart from '../components/charts/AgencyBarChart';
import DatePickerBuddhist from "../components/date-picker-buddhist/DatePickerBuddhist";
import Loading from "../components/loading/Loading";

// API
import { getUsageExternalPoliceChart } from "../features/usage-chart/api/UsageChartApi";

// Types
import type { UsageChartResponse } from "../types/response";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

dayjs.extend(buddhistEra);

interface FormData {
  month_year: Date | null;
}

const ChartExternalPolice = () => {
  usePageTitle("แผนภูมิหน่วยงานภายนอก ตร.");

  // State
  const [monthRange, setMonthRange] = useState<1 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [data, setData] = useState<UsageChartResponse | null>(null);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    month_year: dayjs().toDate(),
  });

  useEffect(() => {
    if (!formData.month_year) return;

    fetchData(dayjs(formData.month_year).format("YYYY-MM-DD"), monthRange);
  }, [formData.month_year, monthRange]);

  const fetchData = useCallback(
    async (monthYear: string, range: 1 | 3) => {
      setIsLoading(true);
      const res = await getUsageExternalPoliceChart(monthYear, range);
      setData(res);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    },
    []
  );

  const handleStateChange = (value: 1 | 3) => {
    setMonthRange(value);
  };

  const handleDateTimeChange = (key: keyof typeof formData, date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: date,
    }));
  };

  return (
    <section id='chart-external-police'>
      <Box className='p-4 flex flex-col gap-4'>
        {isLoading && <Loading />}
        {/* Main Title */}
        <MainTitle title="แผนภูมิหน่วยงานภายนอก ตร." />

        {/* Chart */}
        <Box 
          className="w-full h-full bg-(--secondary-color) p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(0,0,0,0.1)"
          }}
        >
          <Box className='flex gap-2'>
            <Box className='flex flex-col gap-2 w-75'>
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
                id="month-year"
                onChange={(value) =>
                  handleDateTimeChange("month_year", value)
                }

                label={"เดือนหลัก"}
                labelFontSize="14px"
                views={["year", "month"]}
                openTo="month"
                format='MMMM YYYY'
                maxDate={dayjs()}
              />
            </Box>
            <Box className='flex gap-3 items-end'>
              <Button
                variant="contained"
                sx={{
                  width: 90,
                  height: 40,
                  backgroundColor: monthRange === 1 ? "var(--primary-color)" : "var(--secondary-color)",
                  color: monthRange === 1 ? "var(--secondary-color)" : "var(--primary-color)",
                  border: monthRange === 1 ? "none" : "1px solid var(--primary-color)",
                  "&:hover": {
                    backgroundColor: monthRange === 1 ? "var(--primary-color)" : "var(--range-button-color-hover)",
                  },
                  fontWeight: 700,
                }}
                onClick={() => handleStateChange(1)}
              >
                1 เดือน
              </Button>
              <Button
                variant="contained"
                sx={{
                  width: 90,
                  height: 40,
                  backgroundColor: monthRange === 3 ? "var(--primary-color)" : "var(--secondary-color)",
                  color: monthRange === 3 ? "var(--secondary-color)" : "var(--primary-color)",
                  border: monthRange === 3 ? "none" : "1px solid var(--primary-color)",
                  "&:hover": {
                    backgroundColor: monthRange === 3 ? "var(--primary-color)" : "var(--range-button-color-hover)",
                  },
                  fontWeight: 700,
                }}
                onClick={() => handleStateChange(3)}
              >
                3 เดือน
              </Button>
            </Box>
          </Box>
          {
            data && (
              <AgencyBarChart
                data={data?.data ?? []}
                columns={data?.columns ?? []}
                selectedMonthYear={dayjs(formData.month_year).format("YYYY-MM-DD")}
              />
            )
          }
        </Box>
      </Box>
    </section>
  )
};

export default ChartExternalPolice;
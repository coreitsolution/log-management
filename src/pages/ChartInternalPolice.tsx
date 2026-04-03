import React, { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs';

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Components
import MainTitle from "../components/main-title/MainTitle";
import AutoComplete from "../components/auto-complete/AutoComplete";
import AgencyBarChart from '../components/charts/AgencyBarChart';

// API
import { getUsageInternalPoliceChart } from "../features/usage-chart/api/UsageChartApi";

// Types
import type { UsageChartResponse } from "../types/reponse";
import type { Option } from "../types/common";

type Props = {}

const ChartInternalPolice = (props: Props) => {

  // State
  const [monthRange, setMonthRange] = useState<1 | 3>(1);

  // Data
  const [monthYearSelect, setMonthYearSelect] = useState<string>("");
  const [data, setData] = useState<UsageChartResponse | null>(null);

  // Options
  const [monthYearOptions, setMonthYearOptions] = useState<Option[]>([]);

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

    fetchData(monthYearSelect, monthRange);
  }, [monthYearSelect, monthRange]);

  const fetchData = useCallback(
    async (monthYear: string, range: 1 | 3) => {
      const res = await getUsageInternalPoliceChart(monthYear, range);
      setData(res);
    },
    []
  );

  const handleMonthYearChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      setMonthYearSelect(value.value);
    }
    else {
      setMonthYearSelect("");
    }
  };

  const handleStateChange = (value: 1 | 3) => {
    setMonthRange(value);
  };

  return (
    <section id='chart-internal-police'>
      <Box className='p-4 flex flex-col gap-4'>
        {/* Main Title */}
        <MainTitle title="แผนภูมิหน่วยงานภายใน ตร." />

        {/* Chart */}
        <Box 
          className="w-full h-full bg-(--secondary-color) p-4 flex flex-col gap-4"
          sx={{
            boxShadow: "-2px 3px 2px rgba(0,0,0,0.1)"
          }}
        >
          <Box className='flex gap-2'>
            <Box className='flex flex-col gap-2 w-75'>
              <label className='text-[15px] text-(--component-color)'>เดือนหลัก</label>
              <AutoComplete 
                id="month-year-select"
                value={monthYearSelect}
                onChange={handleMonthYearChange}
                options={monthYearOptions}
                label=""
                labelFontSize="15px"
                placeholder={"เลือกเดือนหลัก"}
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
          <AgencyBarChart
            data={data?.data ?? []}
            columns={data?.columns ?? []}
            selectedMonthYear={monthYearSelect}
          />
        </Box>
      </Box>
    </section>
  )
};

export default ChartInternalPolice;
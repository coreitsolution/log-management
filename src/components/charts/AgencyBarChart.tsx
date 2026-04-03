import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Types
import type { AgencyChartDataGroup, AgencyColumn } from "../../types/common";

dayjs.extend(buddhistEra);

interface Props {
  data: AgencyChartDataGroup[];
  columns: AgencyColumn[];
  selectedMonthYear: string;
}

const MAX_BAR = 3;

const AgencyBarChart = ({ data, columns, selectedMonthYear }: Props) => {
  // Group by agency name
  const agencyMap: Record<string, any> = {};

  data.forEach((group) => {
    const monthKey = `month_${group.month}`;

    group.data.forEach((item) => {
      if (!agencyMap[item.key]) {
        agencyMap[item.key] = {
          key: item.key,
        };
      }

      agencyMap[item.key][monthKey] = item.value;
    });
  });

  const chartData = Object.values(agencyMap);

  // Limit to max 3 months
  const months = data
    .map((d) => d.month)
    .slice(0, MAX_BAR)
    .sort((a, b) => Number(a) - Number(b));

  // Color by month
  const getColor = (index: number) => {
    const total = months.length;

    if (total === 1) {
      return "#93C3EB";
    }

    if (total === 2) {
      const isNewest = index === total - 1;
      return isNewest ? "#93C3EB" : "#2196F3";
    }

    const COLORS = [
      "#1566C0", // oldest
      "#2196F3",
      "#93C3EB", // newest
    ];

    return COLORS[index] ?? "#93C3EB";
  };

  const checkSameMonthYear = (a: string, b: string) => {
    const dateA = dayjs(a);
    const dateB = dayjs(b);
    return (
      dateA.year() === dateB.year() && dateA.month() === dateB.month()
    );
  };

  const monthIndexMap = months.reduce((acc, m, i) => {
    acc[m] = i;
    return acc;
  }, {} as Record<number, number>);

  const gridCols = `145px repeat(${columns.length}, 1fr)`;

  return (
    <div className="w-full">
      <div className="min-w-200">
        {/* Chart */}
        <ResponsiveContainer width="100%" maxHeight={1520} height={350}>
          <BarChart 
            data={chartData} 
            margin={{ left: 85 }} 
            barCategoryGap="10%"
            barGap={4}
          >
            <CartesianGrid stroke="#9E9E9E" horizontal vertical={false} />
            <CartesianGrid stroke="#DBDCDE" vertical horizontal={false} />

            {/* X = Agency */}
            <XAxis dataKey="key" hide />

            <YAxis
              domain={[0, "auto"]}
              tickCount={10}
              tick={{ fill: "#124692" }}
              strokeWidth={0}
            />

            {/* Bars = months */}
            {months
              .map((month, index) => (
                <Bar
                  key={month}
                  dataKey={`month_${month}`}
                  fill={getColor(index)}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="w-full border border-[#DBDCDE] overflow-hidden">

            {/* Header */}
            <div
              className="grid text-sm border-b border-[#DBDCDE] bg-(--primary-color) text-(--secondary-color)"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="p-2 text-center border-r border-[#DBDCDE]">
                เดือน
              </div>

              {columns.map((item, idx) => (
                <div
                  key={item.key}
                  className={`p-2 min-w-[0.5vw] text-center whitespace-normal wrap-break-word ${
                    idx !== columns.length - 1 ? "border-r border-[#DBDCDE]" : ""
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {data.sort((a, b) => Number(b.month) - Number(a.month)).map((group) => {
              const isSameMonthYear = checkSameMonthYear(group.month_year, selectedMonthYear)

              return (
                <div
                  key={group.month}
                  className="grid text-sm border-b border-[#DBDCDE]"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {/* Month */}
                  <div 
                    className="flex items-center min-w-36 gap-2 px-2 border-r border-[#DBDCDE]"
                    style={{
                      backgroundColor: isSameMonthYear ? "var(--current-date-highlight-bg-color)" : "",
                      color: "var(--text-chart-table-color)",
                      fontWeight: isSameMonthYear ? "700" : "400",
                    }}
                  >
                    <div
                      className="w-4 h-4 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: getColor(monthIndexMap[group.month] ?? 0),
                      }}
                    />
                    <div>
                      {dayjs(group.month_year)
                        .format("MMMM BBBB")}
                    </div>
                  </div>

                  {/* Values */}
                  {group.data.map((item, idx) => (
                    <div
                      key={item.key}
                      className={`p-2 min-w-[0.5vw] text-center whitespace-normal wrap-break-word ${
                        idx !== group.data.length - 1
                          ? "border-r border-[#DBDCDE]"
                          : ""
                      }`}
                      style={{
                        backgroundColor: isSameMonthYear
                          ? "var(--current-date-highlight-bg-color)"
                          : "",
                        color: "var(--text-chart-table-color)",
                        fontWeight: isSameMonthYear ? "700" : "400",
                      }}
                    >
                      {item.value.toLocaleString()}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyBarChart;
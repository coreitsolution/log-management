import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

// Material UI
import Box from "@mui/material/Box";

// Types
import type { OverallLineChart } from "../../types/chart";

dayjs.extend(buddhistEra);
dayjs.locale("th");

type Props = {
  data: OverallLineChart[];
  isMonth?: boolean;
}

const LineChartComponent = ({ data, isMonth = false }: Props) => {
  const STATUS_CONFIG = [
    {
      key: "normal",
      label: "สถานะปกติ",
      color: "var(--status-device-normal)",
    },
    {
      key: "device",
      label: "อุปกรณ์ขัดข้อง",
      color: "var(--status-device-outage)",
    },
    {
      key: "network",
      label: "เครือข่ายขัดข้อง",
      color: "var(--status-network-outage)",
    },
    {
      key: "disable",
      label: "อุปกรณ์ปิดใช้งาน",
      color: "var(--status-device-disable)",
    },
  ];

  const STATUS_MAP = Object.fromEntries(
    STATUS_CONFIG.map(item => [item.key, item])
  );

  const CustomLegend = () => {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        paddingTop: "12px",
        fontSize: "16px",
      }}>
        {STATUS_CONFIG.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />
            <span style={{ color: "var(--percent-text-color)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        style={{
          background: "var(--secondary-color)",
          border: "1px solid var(--primary-color)",
          borderRadius: "8px",
          padding: "10px 12px",
          minWidth: "180px",
        }}
      >
        {/* Date */}
        <div
          style={{
            fontSize: "13px",
            marginBottom: "8px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {dayjs(label).format("dddd D MMMM BBBB")}
        </div>

        {/* Data */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {payload.map((item: any) => {
            const config = STATUS_MAP[item.dataKey];

            return (
              <div
                key={item.dataKey}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: config?.color,
                    }}
                  />
                  <span>{config?.label}</span>
                </div>

                <span style={{ fontWeight: 600 }}>
                  {item.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Box className="flex justify-center items-center">
      <LineChart
        style={{ width: '100%', maxWidth: '850px', height: '100%', maxHeight: '80vh', aspectRatio: 1.618 }}
        responsive
        data={data}
        margin={{
          top: 5,
          right: 50,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid stroke="#DBDCDE" horizontal vertical/>
        <XAxis 
          dataKey="date" 
          stroke="var(--text-chart-table-color)" 
          strokeWidth={0}
          tick={{
            fontSize: 14,
          }}
          interval={0}
          tickFormatter={(value) => isMonth ? dayjs(value).format("D") : dayjs(value).format("ddDD/MM/BB")}
        />
        <YAxis 
          width="auto" 
          stroke="var(--text-chart-table-color)" 
          strokeWidth={0} 
          tick={{
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border-2)" }}
          content={<CustomTooltip />}
        />
        <Legend content={<CustomLegend />} />
        {STATUS_CONFIG.map((item) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            stroke={item.color}
            dot={{ fill: item.color }}
            activeDot={{ r: 8, stroke: item.color }}
          />
        ))}
      </LineChart>
    </Box>
  )
}

export default LineChartComponent;
import { Pie, PieChart, Label } from 'recharts';

// Material UI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Types
import type { OverallPieChart } from "../../types/chart";

type Props = {
  data: OverallPieChart[];
};

const PieChartComponent = ({ data }: Props) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box className="flex flex-col gap-4 items-center justify-center">
      <PieChart
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '43vh',
          aspectRatio: 1
        }}
      >
        <Pie
          data={data}
          innerRadius="60%"
          outerRadius="100%"
          cornerRadius={10}
          paddingAngle={1}
          dataKey="value"
          isAnimationActive
          startAngle={-270}
          endAngle={-630}
        >
          <Label
            position="center"
            content={({ viewBox }: any) => {
              const cx = viewBox?.cx ?? 200;
              const cy = viewBox?.cy ?? 200;

              return (
                <g>
                  <text
                    x={cx + 50}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 52, fontWeight: 600, fill: "#1f5a8a" }}
                  >
                    {total.toLocaleString()}
                  </text>
                  <line
                    x1={cx - 20}
                    x2={cx + 120}
                    y1={cy + 30}
                    y2={cy + 30}
                    stroke="#C5C8CB"
                    strokeWidth={1}
                  />
                  <circle
                    cx={cx - 10}
                    cy={cy + 50}
                    r={5}
                    fill="var(--status-all)"
                  />
                  <text
                    x={cx + 55}
                    y={cy + 50}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 18, fill: "#6b7280" }}
                  >
                    จุดตรวจทั้งหมด
                  </text>
                </g>
              );
            }}
          />
        </Pie>
      </PieChart>
      <Box className="grid grid-cols-4 border border-[#D9D9D9] w-full overflow-hidden rounded-sm">
        {
          data.map((item, index) => (
            <Box 
              key={`${item.name}-${index}`} 
              className="flex flex-col items-center justify-center gap-2"
              sx={{
                borderLeft: index === 0 ? "none" : "1px solid #D9D9D9",
              }}
            >
              <Box className="flex flex-col items-center justify-center">
                <Typography sx={{ fontSize: 38, fontWeight: 500 }} variant='subtitle1' color='var(--primary-color)'>
                  {item.value.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 400, marginTop: -2.6 }} variant='subtitle1' color='var(--percent-text-color)'>
                  {`(${item.percent_value.toFixed(1)}%)`}
                </Typography>
              </Box>
              <Box className="flex items-center justify-center gap-1 -mt-[8px]">
                <Box 
                  className="w-3 h-3"
                  sx={{
                    borderRadius: "50%",
                    backgroundColor: item.fill,
                  }}
                />
                <Typography sx={{ fontSize: 16, fontWeight: 400 }} variant='subtitle1' color='var(--percent-text-color)'>
                  {item.name_th}
                </Typography>
              </Box>
            </Box>
          ))
        }
      </Box>
    </Box>
  );
};

export default PieChartComponent;
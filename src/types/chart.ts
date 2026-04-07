export interface OverallPieChart {
  name: string;
  name_th: string;
  value: number;
  percent_value: number;
  fill: string;
}

export interface OverallLineChart {
  date: string;
  normal: number;
  device: number;
  network: number;
  disable: number;
}
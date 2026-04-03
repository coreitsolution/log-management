// Types
import type { AgencyChartDataGroup, AgencyColumn, TopUsersType } from "../types/common";

export interface UsageChartResponse {
  data: AgencyChartDataGroup[];
  columns: AgencyColumn[];
}


export interface TopUsersResponse {
  messages: string;
  results: TopUsersType[];
  status: string;
  total_matches: number;
  total: number;
}

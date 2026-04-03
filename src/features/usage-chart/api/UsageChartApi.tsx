// Types
import type { AgencyColumn, AgencyChartDataGroup } from "../../../types/common";
import type { UsageChartResponse, TopUsersResponse } from "../../../types/reponse";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import {
  mockAgencyExternalPoliceColumn,
  mockAgencyExternalPoliceDataGroup,
} from "../../../mocks/mockAgencyExternalPolice";
import {
  mockAgencyInternalNsbColumn,
  mockAgencyInternalNsbDataGroup,
} from "../../../mocks/mockAgencyInternalNsb";
import {
  mockAgencyInternalPoliceColumn,
  mockAgencyInternalPoliceDataGroup,
} from "../../../mocks/mockAgencyInternalPolice";
import {
  mockTopExternalUsers,
  mockTopInternalUsers,
} from "../../../mocks/mockTopUsers";

// Env
const isDev = import.meta.env.DEV;

export const getUsageExternalPoliceChart = async (selectedMonthYear: string, monthRange: 1 | 3): Promise<UsageChartResponse> => {
  if (isDev) {
    return {
      columns: mockAgencyExternalPoliceColumn,
      data: mockAgencyExternalPoliceDataGroup.slice(0, monthRange),
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        monthRange,
      }),
    },
  );

  return {
    columns: mockAgencyExternalPoliceColumn,
    data: res.data,
  };
};

export const getUsageInternalNsbChart = async (selectedMonthYear: string, monthRange: 1 | 3): Promise<UsageChartResponse> => {
  if (isDev) {
    return {
      columns: mockAgencyInternalNsbColumn,
      data: mockAgencyInternalNsbDataGroup.slice(0, monthRange),
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        monthRange,
      }),
    },
  );

  return {
    columns: mockAgencyInternalNsbColumn,
    data: res.data,
  };
};

export const getUsageInternalPoliceChart = async (selectedMonthYear: string, monthRange: 1 | 3): Promise<UsageChartResponse> => {
  if (isDev) {
    return {
      columns: mockAgencyInternalPoliceColumn,
      data: mockAgencyInternalPoliceDataGroup.slice(0, monthRange),
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        monthRange,
      }),
    },
  );

  return {
    columns: mockAgencyInternalPoliceColumn,
    data: res.data,
  };
};

export const getTopUsersChart = async (selectedMonthYear: string, policeState: "internal" | "external"): Promise<TopUsersResponse> => {
  if (isDev) {
    return policeState === "internal" ? mockTopInternalUsers : mockTopExternalUsers;
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        policeState,
      }),
    },
  );

  return policeState === "internal" ? mockTopInternalUsers : mockTopExternalUsers;
};
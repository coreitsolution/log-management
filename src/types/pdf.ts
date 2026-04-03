// Types
import type { AgencyUsage, PersonUsage, LogUsage, SearchLog } from "./common";

export interface AgencyUsagePdfData {
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string;
  start_date: string;
  end_date: string;
  agencyUsage: AgencyUsage[];
}

export interface PersonUsagePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string;
  org_id: number;
  org_name: string;
  start_date: string;
  end_date: string;
  personUsage: PersonUsage[];
}

export interface LogUsagePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string;
  org_id: number;
  org_name: string;
  start_date: string;
  end_date: string;
  logUsage: LogUsage[];
}

export interface SearchAgencyPlatePdfData {
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string;
  plate_group: string;
  plate_number: string;
  province_id: number;
  province_name: string;
  start_date: string;
  end_date: string;
  agencyPlate: AgencyUsage[];
}

export interface SearchPersonPlatePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string;
  org_id: number;
  org_name: string;
  plate_group: string;
  plate_number: string;
  province_id: number;
  province_name: string;
  start_date: string;
  end_date: string;
  personPlate: PersonUsage[];
}

export interface SearchLogPlatePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string;
  org_id: number;
  org_name: string;
  plate_group: string;
  plate_number: string;
  province_id: number;
  province_name: string;
  start_date: string;
  end_date: string;
  logPlate: SearchLog[];
}

export interface OverallCheckpointsPdfData {
  checkpoint_uid: string,
  checkpoint_name: string,
  camera_uid: string,
  camera_name: string,
  station_id: number,
  station_name: string,
  area_id: number,
  area_name: string,
  province_id: number,
  province_name: string,
  district_id: number,
  district_name: string,
  subdistrict_id: number,
  subdistrict_name: string,
  road: string,
  route: string,
  project: string,
}
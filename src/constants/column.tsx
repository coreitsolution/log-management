// Types
import type { ColumnOption } from "../types/common";

export const OVERALL_CHECKPOINTS = [
  { key: "camera", label: "ด่านตรวจ" },
  { key: "station", label: "สถานีตำรวจ" },
  { key: "area", label: "พื้นที่" },
  { key: "province", label: "จังหวัด" },
  { key: "district", label: "อำเภอ" },
  { key: "subdistrict", label: "ตำบล" },
  { key: "road", label: "ถนน" },
  { key: "route", label: "เส้นทาง" },
  { key: "project", label: "โครงการ" },
]

export const DEFAULT_COLUMN_OPTIONS: ColumnOption[] =
  OVERALL_CHECKPOINTS.map((item) => ({
    ...item,
    checked: true,
  }));
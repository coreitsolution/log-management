import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { OverallReportPdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateOverallReportPdfBlob = async (
  data: OverallReportPdfData
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const overallReport: TableCell[][] = [
    [
      { text: "พื้นที่", style: "tableHeader" },
      { text: "จุดตรวจทั้งหมด", style: "tableHeader" },
      { text: "สถานะปกติ", style: "tableHeader" },
      { text: "อุปกรณ์ขัดข้อง", style: "tableHeader" },
      { text: "เครือข่ายขัดข้อง", style: "tableHeader" },
      { text: "ปิดการใช้งาน", style: "tableHeader" },
      { text: "ความพร้อม (%)", style: "tableHeader" },
    ],
    ...data.overallReport.map((item, index, arr) => {
      const isLast = index === arr.length - 1;

      const cellStyle = isLast ? { style: "totalSum" } : {};

      return [
        { text: item.police_division_name, ...cellStyle },
        { text: item.total.toLocaleString(), ...cellStyle, alignment: "right"},
        { text: `${item.normal.toLocaleString()} (${item.normal_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: `${item.device.toLocaleString()} (${item.device_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: `${item.network.toLocaleString()} (${item.network_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: `${item.disable.toLocaleString()} (${item.disable_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: item.ready_percent.toFixed(1), ...cellStyle, alignment: "right" },
      ] as TableCell[];
    }),
  ];

  const overallReportDetail: TableCell[][] = [
    [
      { text: "ลำดับ", style: "tableHeader" },
      { text: "จุดตรวจ", style: "tableHeader" },
      { text: "ด่านตรวจ", style: "tableHeader" },
      { text: "สถานีตำรวจ", style: "tableHeader" },
      { text: "พื้นที่", style: "tableHeader" },
      { text: "จังหวัด", style: "tableHeader" },
      { text: "โครงการ", style: "tableHeader" },
      { text: "สถานะ", style: "tableHeader" },
      { text: "วันที่มี ปัญหา", style: "tableHeader" },
      { text: "%ปัญหา", style: "tableHeader" },
      { text: "หมายเหตุ", style: "tableHeader" },
    ],
    ...data.overallReportDetail.map((item, index) => [
      { text: index + 1, alignment: "center" } as TableCell,
      { text: item.checkpoint_name } as TableCell,
      { text: item.camera_name } as TableCell,
      { text: item.station_name } as TableCell,
      { text: item.area_name } as TableCell,
      { text: item.province_name } as TableCell,
      { text: item.project, alignment: "center" } as TableCell,
      { text: item.status_id === 1 ? "เปิดใช้งาน" : "ปิดใช้งาน", alignment: "center" } as TableCell,
      { text: item.date_count_error, alignment: "center" } as TableCell,
      { text: item.date_count_error_percent.toFixed(1), alignment: "center" } as TableCell,
      { text: item.remark } as TableCell,
    ]),
  ];

  const lastOverallReportRowIndex = overallReport.length - 1;

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [10, 30, 10, 30],
    pageOrientation: "landscape",
    defaultStyle: {
      font: "Sarabun",
      fontSize: 10,
    },
    header: () => ({
      columns: [
        {
          text: data.title,
          alignment: "left",
          color: "#ACACAC",
        },
        {
          text: `วันที่ออกข้อมูล: ${dayjs().format("DD/MM/BBBB HH:mm:ss")}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [10, 10, 10, 10],
    }),
    content: [
      {
        text: data.title,
        alignment: "center",
        style: "header",
        color: "#000000",
        margin: [0, 0, 0, 30],
      },
      {
        alignment: "center",
        columns: [
          {
            margin: [0, 0, 20, 0],
            columns: [
              { text: "วันที่", width: 50 },
              { text: data.date, bold: true },
            ],
          },
          {
            margin: [10, 0, 10, 0],
            columns: [
              { text: "พื้นที่", width: 50 },
              { text: data.area, bold: true },
            ],
          },
          {
            margin: [10, 0, 10, 0],
            columns: [
              { text: "จังหวัด", width: 50 },
              { text: data.province, bold: true },
            ],
          },
          {
            margin: [10, 0, 10, 0],
            columns: [
              { text: "โครงการ", width: 50 },
              { text: data.project, bold: true },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: Array(overallReport[0]?.length).fill("*"),
          body: overallReport,
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0 || rowIndex === lastOverallReportRowIndex) {
              return "#D9D9D9";
            }
            return null;
          },
          hLineColor: () => "#BFBFBF",
          vLineColor: () => "#BFBFBF",
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
      {
        pageBreak: "before",
        text: data.title,
        alignment: "center",
        style: "header",
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 95, 95, 95, 50, 50, 60, 50, 40, 40, 95],
          body: overallReportDetail,
        },
        layout: {
          fillColor: (rowIndex: number) => {
            return rowIndex === 0 ? "#D9D9D9" : null;
          },
          hLineColor: () => "#BFBFBF",
          vLineColor: () => "#BFBFBF",
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      tableHeader: {
        bold: true,
        fillColor: "#eeeeee",
        color: "#000000",
        alignment: "center",
      },
      totalSum: {
        bold: true,
        fillColor: "#eeeeee",
        color: "#000000",
      },
    },
    footer: (currentPage: number) => ({
      text: currentPage,
      alignment: "right",
      margin: [0, 10, 40, 0],
    }),
  };

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);

  return new Promise<Blob>((resolve, reject) => {
    pdfDocGenerator.getBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PDF generation failed"));
    });
  });
};

export const downloadOverallReportPdf = async (
  data: OverallReportPdfData,
  fileName: string
) => {
  const blob = await generateOverallReportPdfBlob(data);
  saveAs(blob, fileName);
};
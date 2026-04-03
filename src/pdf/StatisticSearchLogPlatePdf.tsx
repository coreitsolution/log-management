import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { SearchLogPlatePdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateStatisticSearchLogPlatePdfBlob = async (
  data: SearchLogPlatePdfData
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: "ลำดับ", style: "tableHeader" },
      { text: "ชื่อ-นามสกุล", style: "tableHeader" },
      { text: "เลขบัตร ประชาชน", style: "tableHeader" },
      { text: "วันที่", style: "tableHeader" },
      { text: "รายละเอียด", style: "tableHeader" },
      { text: "IP Address", style: "tableHeader" },
      { text: "พิกัด", style: "tableHeader" },
      { text: "User Agent", style: "tableHeader" },
      { text: "หน่วยงาน", style: "tableHeader" },
      { text: "กอง บัญชาการ", style: "tableHeader" },
      { text: "กอง บังคับการ", style: "tableHeader" },
      { text: "กอง กำกับการ", style: "tableHeader" },
    ],
    ...data.logPlate.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: item.name } as TableCell,
      { text: item.pid } as TableCell,
      { text: dayjs(item.date_time).format("DD/MM/BBBB HH:mm")} as TableCell,
      { text: item.detail } as TableCell,
      { text: item.ip_address } as TableCell,
      { text: `${item.latitude},${item.longitude}`} as TableCell,
      { text: item.user_agent } as TableCell,
      { text: item.agency_name } as TableCell,
      { text: item.bh_name } as TableCell,
      { text: item.bk_name } as TableCell,
      { text: item.org_name } as TableCell,
    ]),
  ];

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
          text: "รายงาน Log การใช้งาน",
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
        text: "รายงาน Log การใช้งาน",
        alignment: "center",
        style: "header",
        color: "#000000",
      },
      {
        columns: [
          {
            columns: [
              { text: "เลขบัตรประชาชน/รหัสลายน้ำ", width: 140 },
              { text: data.pid_or_water_mark, bold: true },
            ],
          },
          {
            columns: [
              { text: "ชื่อ-นามสกุล", width: 80 },
              { text: data.name, bold: true },
            ],
          },
          {
            columns: [
              { text: "ระหว่างวันที่", width: 80 },
              { text: `${data.start_date} - ${data.end_date}`, bold: true },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: "หน่วยงาน", width: 140 },
              { text: data.agency_name, bold: true },
            ]
          },
          {
            columns: [
              { text: "กองบัญชาการ", width: 80 },
              { text: data.bh_name, bold: true },
            ]
          },
          {
            columns: [
              { text: "กองบังคับการ", width: 80 },
              { text: data.bk_name, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: "กองกำกับการ", width: 140 },
              { text: data.org_name, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 55, 45, 45, 120, 45, 45, 120, 45, 45, 45, 45],
          body,
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
      },
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
        color: "#585858",
        alignment: "center",
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

export const downloadStatisticSearchLogPlatePdf = async (
  data: SearchLogPlatePdfData,
  fileName: string
) => {
  const blob = await generateStatisticSearchLogPlatePdfBlob(data);
  saveAs(blob, fileName);
};
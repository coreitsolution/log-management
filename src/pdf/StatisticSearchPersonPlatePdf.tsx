import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { SearchPersonPlatePdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { formatNumber } from "../utils/commonFunctions";
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateStatisticSearchPersonPlatePdfBlob = async (
  data: SearchPersonPlatePdfData
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: "ลำดับ", style: "tableHeader" },
      { text: "จำนวน", style: "tableHeader" },
      { text: "ชื่อ-นามสกุล", style: "tableHeader" },
      { text: "เลขบัตรประชาชน", style: "tableHeader" },
      { text: "หน่วยงาน", style: "tableHeader" },
      { text: "กองบัญชาการ", style: "tableHeader" },
      { text: "กองบังคับการ", style: "tableHeader" },
      { text: "กองกำกับการ", style: "tableHeader" },
    ],
    ...data.personPlate.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: formatNumber(item.usage_count), alignment: "center" } as TableCell,
      { text: item.name } as TableCell,
      { text: item.pid } as TableCell,
      { text: item.agency_name } as TableCell,
      { text: item.bh_name } as TableCell,
      { text: item.bk_name } as TableCell,
      { text: item.org_name } as TableCell,
    ]),
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [20, 30, 20, 20],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 10,
    },
    header: () => ({
      columns: [
        {
          text: "รายงานสถิติการค้นหาป้ายทะเบียน (รายบุคคล)",
          alignment: "left",
          color: "#ACACAC",
        },
        {
          text: `วันที่ออกข้อมูล: ${dayjs().format("DD/MM/BBBB HH:mm:ss")}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [20, 10, 20, 10],
    }),
    content: [
      {
        text: "รายงานสถิติการค้นหาป้ายทะเบียน (รายบุคคล)",
        alignment: "center",
        style: "header",
        color: "#000000",
      },
      {
        columns: [
          {
            columns: [
              {
                columns: [
                  { text: "เลขบัตรประชาชน/รหัสลายน้ำ", width: 140 },
                  { text: data.pid_or_water_mark, bold: true },
                ]
              },
            ],
          },
          {
            columns: [
              {
                columns: [
                  { text: "ชื่อ-นามสกุล", width: 80 },
                  { text: data.name, bold: true },
                ]
              },
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
            ],
          },
          {
            columns: [
              { text: "กองบัญชาการ", width: 80 },
              { text: data.bh_name, bold: true },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: "กองบังคับการ", width: 140 },
              { text: data.bk_name, bold: true },
            ]
          },
          {
            columns: [
              { text: "กองกำกับการ", width: 80 },
              { text: data.org_name, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: "ทะเบียนรถ", width: 140 },
              { text: `${data.plate_group || "-"} ${data.plate_number || "-"} ${data.province_name || "-"}`, bold: true },
            ]
          },
          {
            columns: [
              { text: "ระหว่างวันที่", width: 80 },
              { text: `${data.start_date} - ${data.end_date}`, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 35, 95, 80, "*", "*", "*", "*"],
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

export const downloadStatisticSearchPersonPlatePdf = async (
  data: SearchPersonPlatePdfData,
  fileName: string
) => {
  const blob = await generateStatisticSearchPersonPlatePdfBlob(data);
  saveAs(blob, fileName);
};
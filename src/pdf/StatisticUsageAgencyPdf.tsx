import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { AgencyUsagePdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { formatNumber } from "../utils/commonFunctions";
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateStatisticUsageAgencyPdfBlob = async (
  data: AgencyUsagePdfData
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: "ลำดับ", style: "tableHeader" },
      { text: "จำนวน", style: "tableHeader" },
      { text: "หน่วยงาน", style: "tableHeader" },
      { text: "กองบัญชาการ", style: "tableHeader" },
      { text: "กองบังคับการ", style: "tableHeader" },
      { text: "กองกำกับการ", style: "tableHeader" },
    ],
    ...data.agencyUsage.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: formatNumber(item.usage_count), alignment: "center" } as TableCell,
      { text: item.agency_name } as TableCell,
      { text: item.bh_name } as TableCell,
      { text: item.bk_name } as TableCell,
      { text: item.org_name } as TableCell,
    ]),
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 10,
    },
    header: () => ({
      columns: [
        {
          text: "รายงานสถิติการใช้งาน (หน่วยงาน)",
          alignment: "left",
          color: "#ACACAC",
        },
        {
          text: `วันที่ออกข้อมูล: ${dayjs().format("DD/MM/BBBB HH:mm:ss")}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [40, 10, 40, 20],
    }),
    content: [
      {
        text: "รายงานสถิติการใช้งาน (หน่วยงาน)",
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
                  { text: "หน่วยงาน", width: 80 },
                  { text: data.agency_name, bold: true },
                ]
              },
            ],
          },
          {
            columns: [
              {
                columns: [
                  { text: "กองบัญชาการ", width: 80 },
                  { text: data.bh_name, bold: true },
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
              { text: "กองบังคับการ", width: 80 },
              { text: data.bk_name, bold: true },
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
          widths: [40, 60, 80, "*", "*", "*"],
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

// --------------------
// Download
// --------------------
export const downloadStatisticUsageAgencyPdf = async (
  data: AgencyUsagePdfData,
  fileName: string
) => {
  const blob = await generateStatisticUsageAgencyPdfBlob(data);
  saveAs(blob, fileName);
};
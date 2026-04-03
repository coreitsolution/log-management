import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { OverallCheckpointsPdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateOverallCheckpointsPdfBlob = async (
  data: OverallCheckpointsPdfData[]
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: "ลำดับ", style: "tableHeader" },
      { text: "จุดตรวจ", style: "tableHeader" },
      { text: "ด่านตรวจ", style: "tableHeader" },
      { text: "สถานีตำรวจ", style: "tableHeader" },
      { text: "พื้นที่", style: "tableHeader" },
      { text: "จังหวัด", style: "tableHeader" },
      { text: "อำเภอ", style: "tableHeader" },
      { text: "ตำบล", style: "tableHeader" },
      { text: "ถนน", style: "tableHeader" },
      { text: "เส้นทาง", style: "tableHeader" },
      { text: "โครงการ", style: "tableHeader" },
    ],
    ...data.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: item.checkpoint_name } as TableCell,
      { text: item.camera_name } as TableCell,
      { text: item.station_name } as TableCell,
      { text: item.area_name } as TableCell,
      { text: item.province_name } as TableCell,
      { text: item.district_name } as TableCell,
      { text: item.subdistrict_name } as TableCell,
      { text: item.road } as TableCell,
      { text: item.route } as TableCell,
      { text: item.project } as TableCell,
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
          text: "รายงานจุดตรวจ",
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
        text: "รายงานจุดตรวจ",
        alignment: "center",
        style: "header",
        color: "#000000",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 85, 85, 85, 45, 70, 45, 45, 100, 40, 70],
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

export const downloadOverallCheckpointsPdf = async (
  data: OverallCheckpointsPdfData[],
  fileName: string
) => {
  const blob = await generateOverallCheckpointsPdfBlob(data);
  saveAs(blob, fileName);
};
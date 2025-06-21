// components/exportToExcel.jsx
"use client";
import { forwardRef, useImperativeHandle } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = forwardRef((props, ref) => {
  const exportToExcel = (data) => {
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "data-export.xlsx");
  };

  // Allow parent to trigger this method
  useImperativeHandle(ref, () => ({
    exportData(data) {
      exportToExcel(data);
    },
  }));

  return null; // no UI
});

export default exportToExcel;

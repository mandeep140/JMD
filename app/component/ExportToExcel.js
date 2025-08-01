// components/exportToExcel.jsx
"use client";
import { forwardRef, useImperativeHandle } from "react";

const exportToExcel = forwardRef((props, ref) => {
  const exportToExcel = async (data, type = "inventory") => {
    try {
      const response = await fetch("/api/generate-excel/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type,
          data: data,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        // Get filename from response headers
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `JMD_${type}_${new Date()
          .toISOString()
          .split("T")[0]}.xlsx`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log("Excel file downloaded successfully!");
      } else {
        throw new Error("Failed to generate Excel file");
      }
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Error generating Excel file. Please try again.");
    }
  };

  // Allow parent to trigger this method
  useImperativeHandle(ref, () => ({
    exportData(data, type = "inventory") {
      exportToExcel(data, type);
    },
  }));

  return null; // no UI
});

exportToExcel.displayName = "ExportToExcel";

export default exportToExcel;

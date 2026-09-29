import React from "react";

import {
  createReportPdfFile,
  downloadReportPdf,
  getEmailReportUrl,
  getWhatsAppReportUrl,
  shareReportPdf
} from "../services/reportPdfService.js";

export default function ReportPdfActions({
  report,
  imageDataOverride = ""
}) {

  const [sharing, setSharing] =
    React.useState(false);

  const [message, setMessage] =
    React.useState("");

  const handleDownload =
    async () => {

      setMessage("");

      try {

        await downloadReportPdf(
          report,
          imageDataOverride
        );

        setMessage(
          "PDF downloaded."
        );

      } catch (error) {

        setMessage(
          error?.message ||
          "Unable to create PDF."
        );
      }
    };

  const handleSharePdf =
    async () => {

      setMessage("");
      setSharing(true);

      try {

        const shared =
          await shareReportPdf(
            report,
            imageDataOverride
          );

        if (shared) {

          setMessage(
            "PDF shared through the device share sheet."
          );

          return;
        }

        await downloadReportPdf(
          report,
          imageDataOverride
        );

        setMessage(
          "PDF downloaded. This browser does not support direct file sharing."
        );

      } catch (error) {

        if (
          error?.name ===
          "AbortError"
        ) {

          setMessage(
            "Share cancelled."
          );

          return;
        }

        setMessage(
          error?.message ||
          "Unable to share PDF."
        );

      } finally {

        setSharing(false);
      }
    };

  const handleWhatsApp =
    async () => {

      setMessage("");
      setSharing(true);

      try {

        const file =
          await createReportPdfFile(
            report,
            imageDataOverride
          );

        const reportId =
          report?.reportId ||
          report?.id ||
          report?._id ||
          "CITYPULSE-REPORT";

        const shareText =
          [
            "CityPulse AI Civic Report",
            "",
            `Report ID: ${reportId}`,
            `Issue: ${report?.issueType || report?.category || "Civic Issue"}`,
            `Status: ${report?.status || "Submitted"}`,
            `Priority: ${report?.priority || "Medium"}`,
            "",
            "The attached PDF contains the complete report, GPS details and problem evidence image."
          ].join("\n");

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({
            files: [file]
          })
        ) {

          await navigator.share({
            title:
              `CityPulse Report ${reportId}`,

            text:
              shareText,

            files: [file]
          });

          setMessage(
            "PDF ready in the device share sheet. Select WhatsApp to send the actual PDF file."
          );

          return;
        }

        await downloadReportPdf(
          report,
          imageDataOverride
        );

        window.open(
          getWhatsAppReportUrl(
            report
          ),
          "_blank",
          "noopener,noreferrer"
        );

        setMessage(
          "PDF downloaded. This desktop browser cannot attach the local PDF directly to WhatsApp. Use the device Share PDF action on a supported phone."
        );

      } catch (error) {

        if (
          error?.name ===
          "AbortError"
        ) {

          setMessage(
            "WhatsApp PDF share cancelled."
          );

          return;
        }

        setMessage(
          error?.message ||
          "Unable to prepare WhatsApp PDF."
        );

      } finally {

        setSharing(false);
      }
    };

  const handleEmail =
    () => {

      window.location.href =
        getEmailReportUrl(
          report
        );

      setMessage(
        "Email composer opened. Attach the generated PDF."
      );
    };

  const handlePrint =
    async () => {

      try {

        const file =
          await createReportPdfFile(
            report,
            imageDataOverride
          );

        const url =
          URL.createObjectURL(
            file
          );

        const popup =
          window.open(
            url,
            "_blank"
          );

        if (popup) {

          popup.onload =
            () => {

              popup.focus();
              popup.print();
            };
        }

      } catch (error) {

        setMessage(
          error?.message ||
          "Unable to print PDF."
        );
      }
    };

  return (

    <div className="cp-pdf-actions">

      <button
        type="button"
        className="button primary"
        data-testid="pdf-download"
        onClick={handleDownload}
      >
        📄 Download PDF
      </button>

      <button
        type="button"
        className="button primary"
        data-testid="pdf-share"
        onClick={handleSharePdf}
        disabled={sharing}
      >
        {sharing
          ? "Preparing PDF..."
          : "↗ Share PDF"}
      </button>

      <button
        type="button"
        className="button soft"
        data-testid="whatsapp-pdf"
        onClick={handleWhatsApp}
        disabled={sharing}
      >
        WhatsApp PDF
      </button>

      <button
        type="button"
        className="button soft"
        data-testid="email-pdf"
        onClick={handleEmail}
      >
        Email
      </button>

      <button
        type="button"
        className="button soft"
        data-testid="print-pdf"
        onClick={handlePrint}
      >
        Print
      </button>

      {message && (
        <span
          className="cp-pdf-message"
          data-testid="pdf-share-message"
        >
          {message}
        </span>
      )}

    </div>
  );
}

import React from "react";
import {
  nativeShareReport,
  whatsappReport,
  emailReport,
  copyReportText
} from "../services/reportShareService.js";

export default function ShareActions({
  report,
  compact = false
}) {
  const [copied, setCopied] =
    React.useState(false);

  const [sharing, setSharing] =
    React.useState(false);

  const handleNativeShare =
    async () => {
      setSharing(true);

      try {
        await nativeShareReport(report);
      } finally {
        setSharing(false);
      }
    };

  const handleCopy =
    async () => {
      try {
        const success =
          await copyReportText(report);

        if (success) {
          setCopied(true);

          window.setTimeout(() => {
            setCopied(false);
          }, 1800);
        }
      } catch {
        setCopied(false);
      }
    };

  return (
    <div
      className={
        compact
          ? "share-actions compact"
          : "share-actions"
      }
    >
      <button
        type="button"
        className="share-action native"
        onClick={handleNativeShare}
        disabled={sharing}
      >
        {sharing
          ? "Sharing..."
          : "↗ Share"}
      </button>

      <button
        type="button"
        className="share-action whatsapp"
        onClick={() =>
          whatsappReport(report)
        }
      >
        WhatsApp
      </button>

      <button
        type="button"
        className="share-action email"
        onClick={() =>
          emailReport(report)
        }
      >
        Email
      </button>

      <button
        type="button"
        className="share-action copy"
        onClick={handleCopy}
      >
        {copied
          ? "Copied ✓"
          : "Copy"}
      </button>
    </div>
  );
}

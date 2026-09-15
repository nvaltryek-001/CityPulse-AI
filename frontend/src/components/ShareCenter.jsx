import { useState } from "react";
import {
  buildReportShareText,
  getWhatsAppUrl,
  getEmailUrl,
  copyReportShareText,
  nativeShareAvailable,
  nativeShareReport
} from "../services/shareService.js";

export default function ShareCenter({ report = {} }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [email, setEmail] = useState("");

  const shareText = buildReportShareText(report);

  const handleCopy = async () => {
    try {
      await copyReportShareText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      const ok = await nativeShareReport(report);
      if (ok) {
        setShared(true);
        setTimeout(() => setShared(false), 2200);
      }
    } catch {
      // User cancelled native share.
    }
  };

  const whatsappUrl = getWhatsAppUrl(report);
  const emailUrl = getEmailUrl(report, email);

  return (
    <section className="cp-share-card">
      <div className="cp-share-header">
        <div>
          <span className="cp-share-eyebrow">REPORT SHARING</span>
          <h3>Share civic report</h3>
          <p>Send this report to WhatsApp, email, or copy the full report summary.</p>
        </div>

        <div className="cp-share-icon">↗</div>
      </div>

      <div className="cp-share-preview">
        <pre>{shareText}</pre>
      </div>

      <div className="cp-share-actions">
        <a
          className="cp-share-btn cp-whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span>◉</span>
          WhatsApp
        </a>

        <button
          type="button"
          className="cp-share-btn cp-email"
          onClick={() => {
            window.location.href = emailUrl;
          }}
        >
          <span>✉</span>
          Email
        </button>

        <button
          type="button"
          className="cp-share-btn cp-copy"
          onClick={handleCopy}
        >
          <span>{copied ? "✓" : "⧉"}</span>
          {copied ? "Copied" : "Copy report"}
        </button>

        {nativeShareAvailable() && (
          <button
            type="button"
            className="cp-share-btn cp-native"
            onClick={handleNativeShare}
          >
            <span>↗</span>
            {shared ? "Shared" : "More"}
          </button>
        )}
      </div>

      <div className="cp-share-email">
        <label htmlFor="citypulse-share-email">
          Optional recipient email
        </label>

        <input
          id="citypulse-share-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="civic.department@example.com"
        />
      </div>

      <div className="cp-share-note">
        WhatsApp and Email open your device's sharing/mailing interface.
        No fake server-side delivery is claimed.
      </div>
    </section>
  );
}

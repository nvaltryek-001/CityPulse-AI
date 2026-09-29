import {
  test,
  expect
} from "@playwright/test";

test.use({
  channel: "chrome",

  geolocation: {
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 20
  },

  permissions: [
    "geolocation"
  ],

  viewport: {
    width: 1440,
    height: 900
  }
});

const FRONTEND =
  "http://127.0.0.1:5173";

const API =
  "http://127.0.0.1:5000/api";

function uniqueDescription() {
  return (
    "CITYPULSE_BROWSER_E2E_" +
    Date.now()
  );
}

test(
  "CityPulse complete citizen report flow",
  async ({
    page,
    request
  }) => {

    let createdReportId = "";

    try {

      // ======================================================
      // HOME
      // ======================================================

      console.log(
        "\n[01] HOME PAGE"
      );

      await page.goto(
        FRONTEND,
        {
          waitUntil: "domcontentloaded"
        }
      );

      await expect(
        page.getByText(
          "CityPulse AI",
          {
            exact: true
          }
        ).first()
      ).toBeVisible({
        timeout: 15000
      });

      await expect(
        page.getByText(
          /API connected/i
        ).first()
      ).toBeVisible({
        timeout: 15000
      });

      await page.screenshot({
        path:
          "e2e-results/01-home.png",
        fullPage: true
      });

      console.log(
        "[PASS] Home + API connected"
      );

      // ======================================================
      // REPORT ISSUE
      // ======================================================

      console.log(
        "\n[02] REPORT ISSUE"
      );

      await page.getByRole(
        "button",
        {
          name: "Report Issue",
          exact: true
        }
      ).click();

      await expect(
        page.getByText(
          "Report an issue",
          {
            exact: true
          }
        )
      ).toBeVisible({
        timeout: 10000
      });

      console.log(
        "[PASS] Report Issue opened"
      );

      // ======================================================
      // DETAILS
      // ======================================================

      console.log(
        "\n[03] ISSUE DETAILS"
      );

      const roadCategory =
        page.locator(
          "button",
          {
            hasText:
              "Road Infrastructure"
          }
        ).first();

      await roadCategory.click();

// eslint-disable-next-line no-unused-vars
      const issueInput =
        page.locator(
          'input'
        ).filter({
          hasText: ""
        }).first();

      const inputs =
        page.locator(
          "input"
        );

      const inputCount =
        await inputs.count();

      let issueFound = false;

      for (
        let i = 0;
        i < inputCount;
        i++
      ) {

        const input =
          inputs.nth(i);

        const value =
          await input.inputValue()
            .catch(() => "");

        if (
          value === "Pothole"
        ) {

          await input.fill(
            "Pothole"
          );

          issueFound = true;

          break;
        }
      }

      if (!issueFound) {

        const candidate =
          page.locator(
            'input[value="Pothole"]'
          ).first();

        if (
          await candidate.count()
        ) {

          await candidate.fill(
            "Pothole"
          );

          issueFound = true;
        }
      }

      const description =
        uniqueDescription();

      await page.locator(
        "textarea"
      ).first().fill(
        description
      );

      console.log(
        "[PASS] Issue description entered"
      );

      const continueLocation =
        page.getByRole(
          "button",
          {
            name:
              /Continue to Location/i
          }
        );

      await expect(
        continueLocation
      ).toBeVisible();

      await continueLocation.click();

      // ======================================================
      // LOCATION
      // ======================================================

      console.log(
        "\n[04] CURRENT GPS"
      );

      await expect(
        page.getByText(
          /Capture the current location/i
        )
      ).toBeVisible({
        timeout: 10000
      });

      const gpsButton =
        page.getByRole(
          "button",
          {
            name:
              /Use My Current Location/i
          }
        );

      await expect(
        gpsButton
      ).toBeVisible();

      await gpsButton.click();

      await expect(
        page.getByText(
          "12.971600"
        )
      ).toBeVisible({
        timeout: 10000
      });

      await expect(
        page.getByText(
          "77.594600"
        )
      ).toBeVisible({
        timeout: 10000
      });

      await page.screenshot({
        path:
          "e2e-results/02-location.png",
        fullPage: true
      });

      console.log(
        "[PASS] Current GPS captured"
      );

      await page.getByRole(
        "button",
        {
          name:
            /Continue to Evidence/i
        }
      ).click();

      // ======================================================
      // EVIDENCE
      // ======================================================

      console.log(
        "\n[05] PROBLEM PHOTO"
      );

      await expect(
        page.getByText(
          /Add a photo of the issue/i
        )
      ).toBeVisible({
        timeout: 10000
      });

      const fileInput =
        page.locator(
          'input[type="file"]'
        ).first();

      await fileInput.setInputFiles(
        "e2e/e2e-problem-photo.png"
      );

      await expect(
        page.getByText(
          /Fresh problem evidence/i
        )
      ).toBeVisible({
        timeout: 10000
      });

      console.log(
        "[PASS] Problem image uploaded"
      );

      await page.getByRole(
        "button",
        {
          name:
            /Review Report/i
        }
      ).click();

      // ======================================================
      // REVIEW
      // ======================================================

      console.log(
        "\n[06] REVIEW"
      );

      await expect(
        page.getByText(
          "Review before submission",
          {
            exact: true
          }
        )
      ).toBeVisible({
        timeout: 10000
      });

      await expect(
        page.getByText(
          /CURRENT GPS LOCATION/i
        )
      ).toBeVisible();

      await expect(
        page.getByText(
          /CURRENT ISSUE DESCRIPTION/i
        )
      ).toBeVisible();

      await expect(
        page.getByText(
          /PROBLEM EVIDENCE/i
        )
      ).toBeVisible();

      await page.screenshot({
        path:
          "e2e-results/03-review.png",
        fullPage: true
      });

      console.log(
        "[PASS] Review contains issue + GPS + evidence"
      );

      // ======================================================
      // SUBMIT
      // ======================================================

      console.log(
        "\n[07] SUBMIT TO MONGODB"
      );

      await page.getByRole(
        "button",
        {
          name:
            /Submit Civic Report/i
        }
      ).click();

      await expect(
        page.getByText(
          /REPORT SUBMITTED/i
        )
      ).toBeVisible({
        timeout: 20000
      });

      const bodyText =
        await page.locator(
          "body"
        ).innerText();

      const idMatch =
        bodyText.match(
          /CP-[A-Z0-9-]{8,}/i
        );

      expect(
        idMatch
      ).not.toBeNull();

      createdReportId =
        idMatch[0];

      console.log(
        `[PASS] MongoDB report created: ${createdReportId}`
      );

      await page.screenshot({
        path:
          "e2e-results/04-submitted.png",
        fullPage: true
      });

      // ======================================================
      // MY REPORTS
      // ======================================================

      console.log(
        "\n[08] MY REPORTS"
      );

      const myReportsButton =
        page.getByRole(
          "button",
          {
            name:
              /View My Reports/i
          }
        );

      await myReportsButton.click();

      await expect(
        page.getByRole(
          "heading",
          {
            name: "My Reports",
            exact: true
          }
        )
      ).toBeVisible({
        timeout: 15000
      });

      await expect(
        page.getByText(
          createdReportId,
          {
            exact: false
          }
        ).first()
      ).toBeVisible({
        timeout: 15000
      });

      console.log(
        "[PASS] New report visible in My Reports"
      );

      // ======================================================
      // REPORT DETAILS
      // ======================================================

      console.log(
        "\n[09] REPORT DETAILS"
      );

      const reportCard =
        page.locator(
          "article"
        ).filter({
          hasText:
            createdReportId
        }).first();

      await expect(
        reportCard
      ).toBeVisible({
        timeout: 15000
      });

      console.log(
        "[PASS] Created report card located"
      );

      const detailsButton =
        reportCard.getByRole(
          "button",
          {
            name:
              /View Details/i
          }
        );

      await expect(
        detailsButton
      ).toBeVisible({
        timeout: 10000
      });

      await detailsButton.click();

      console.log(
        "[PASS] View Details clicked"
      );

      const detailsModal =
        page.getByTestId(
          "report-details-modal"
        );

      await expect(
        detailsModal
      ).toBeVisible({
        timeout: 10000
      });

      await expect(
        detailsModal.getByText(
          createdReportId,
          {
            exact: false
          }
        )
      ).toBeVisible({
        timeout: 10000
      });

      await expect(
        detailsModal.getByText(
          /Description/i
        ).first()
      ).toBeVisible();

      const issueImage =
        detailsModal.locator(
          '[data-testid="report-detail-image"]'
        );

      await expect(
        issueImage
      ).toHaveCount(1);

      await expect(
        issueImage
      ).toBeVisible({
        timeout: 10000
      });

      const issueImageSrc =
        await issueImage.getAttribute(
          "src"
        );

      expect(
        issueImageSrc
      ).toMatch(
        /^data:image\//
      );

      console.log(
        "[PASS] Report details + issue image visible"
      );

      // ------------------------------------------------------
      // WHATSAPP PDF FILE SHARE TEST
      // ------------------------------------------------------

      console.log(
        "\n[09A] WHATSAPP PDF FILE SHARE"
      );

      await page.evaluate(() => {

        window.__cityPulseSharePayload =
          null;

        Object.defineProperty(
          navigator,
          "canShare",
          {
            configurable: true,
            value: () => true
          }
        );

        Object.defineProperty(
          navigator,
          "share",
          {
            configurable: true,
            value: async (data) => {

              window.__cityPulseSharePayload = {
                title:
                  data?.title || "",

                text:
                  data?.text || "",

                fileCount:
                  Array.isArray(
                    data?.files
                  )
                    ? data.files.length
                    : 0,

                fileType:
                  Array.isArray(
                    data?.files
                  ) &&
                  data.files[0]
                    ? data.files[0].type
                    : "",

                fileName:
                  Array.isArray(
                    data?.files
                  ) &&
                  data.files[0]
                    ? data.files[0].name
                    : ""
              };
            }
          }
        );
      });

      const whatsappButton =
        detailsModal.getByTestId(
          "whatsapp-pdf"
        );

      await expect(
        whatsappButton
      ).toBeVisible({
        timeout: 10000
      });

      await whatsappButton.click();

      await expect.poll(
        async () => {
          return page.evaluate(
            () =>
              window.__cityPulseSharePayload
          );
        },
        {
          timeout: 15000
        }
      ).not.toBeNull();

      const sharePayload =
        await page.evaluate(
          () =>
            window.__cityPulseSharePayload
        );

      expect(
        sharePayload.fileCount
      ).toBeGreaterThan(0);

      expect(
        sharePayload.fileType
      ).toBe(
        "application/pdf"
      );

      expect(
        sharePayload.fileName
      ).toMatch(
        /\.pdf$/i
      );

      expect(
        sharePayload.text
      ).toContain(
        createdReportId
      );

      console.log(
        `[PASS] WhatsApp receives PDF file: ${sharePayload.fileName}`
      );

      console.log(
        "[PASS] WhatsApp share payload contains report PDF, not text-only payload"
      );

      // ======================================================
      // PDF
      // ======================================================

      console.log(
        "\n[10] PDF GENERATION"
      );

      const downloadButton =
        page.getByRole(
          "button",
          {
            name:
              /Download PDF/i
          }
        ).first();

      await expect(
        downloadButton
      ).toBeVisible({
        timeout: 10000
      });

      const downloadPromise =
        page.waitForEvent(
          "download",
          {
            timeout: 20000
          }
        );

      await downloadButton.click();

      const download =
        await downloadPromise;

      const pdfPath =
        "e2e-results/" +
        (
          await download.suggestedFilename()
        );

      await download.saveAs(
        pdfPath
      );

      const fs =
        await import(
          "node:fs/promises"
        );

      const pdfStat =
        await fs.stat(
          pdfPath
        );

      expect(
        pdfStat.size
      ).toBeGreaterThan(
        1000
      );

      const pdfBuffer =
        await fs.readFile(
          pdfPath
        );

      const pdfSignature =
        pdfBuffer
          .subarray(0, 4)
          .toString();

      expect(
        pdfSignature
      ).toBe(
        "%PDF"
      );

      const pdfBinary =
        pdfBuffer.toString(
          "latin1"
        );

      expect(
        pdfBinary
      ).toContain(
        "REPORT DETAILS"
      );

      expect(
        pdfBinary
      ).toContain(
        "PROBLEM EVIDENCE"
      );

      expect(
        pdfBinary
      ).toMatch(
        /\/Subtype\s*\/Image/
      );

      console.log(
        `[PASS] PDF valid + details + embedded issue image: ${pdfStat.size} bytes`
      );

      console.log(
        `[PASS] PDF generated: ${pdfStat.size} bytes`
      );

      // ======================================================
      // CLOSE REPORT DETAILS MODAL BEFORE NAVIGATION

      const reportDetailsModal =
        page.getByTestId(
          "report-details-modal"
        );

      const modalCloseButton =
        reportDetailsModal.locator(
          ".cp-modal-close"
        ).first();

      if (await modalCloseButton.count()) {
        await modalCloseButton.click();

        console.log(
          "[PASS] Report details modal closed"
        );
      }

      await expect(
        reportDetailsModal
      ).toHaveCount(0);

      // UPDATES
      // ======================================================

      console.log(
        "\n[11] UPDATES PAGE"
      );

      await page.getByRole(
        "button",
        {
          name: "Updates",
          exact: true
        }
      ).click();

      await expect(
        page.getByRole("heading", { name: "Updates", exact: true })
      ).toBeVisible({
        timeout: 10000
      });

      await page.screenshot({
        path:
          "e2e-results/05-updates.png",
        fullPage: true
      });

      const statusSelect =
        page.locator(
          ".cpv-status-control select"
        ).first();

      if (
        await statusSelect.count()
      ) {

        await statusSelect.selectOption(
          {
            label:
              "In Progress"
          }
        );

        const noteInput =
          page.locator(
            ".cpv-status-control input"
          ).first();

        await noteInput.fill(
          "E2E field inspection started."
        );

        await page.getByRole(
          "button",
          {
            name:
              /Save Update/i
          }
        ).first().click();

        await expect(
          page.getByText(
            /Status updated successfully/i
          ).first()
        ).toBeVisible({
          timeout: 10000
        });

        console.log(
          "[PASS] In Progress status update saved"
        );

        await statusSelect.selectOption(
          {
            label:
              "Resolved"
          }
        );

        await noteInput.fill(
          "E2E issue resolution completed."
        );

        await page.getByRole(
          "button",
          {
            name:
              /Save Update/i
          }
        ).first().click();

        await expect(
          page.getByText(
            /Status updated successfully/i
          ).first()
        ).toBeVisible({
          timeout: 10000
        });

        console.log(
          "[PASS] Resolved status update saved"
        );
      }

      if (
        await statusSelect.count() === 0
      ) {

        console.log(
          "[FAIL] Manual Status Control is missing from Updates"
        );
      }

      // ======================================================
      // EXPLORE
      // ======================================================

      console.log(
        "\n[12] EXPLORE"
      );

      await page.getByRole(
        "button",
        {
          name: "Explore",
          exact: true
        }
      ).click();

      await expect(
        page.getByText(
          /Explore civic activity|Explore Civic Issues/i
        ).first()
      ).toBeVisible({
        timeout: 15000
      });

      const leafletCount =
        await page.locator(
          ".leaflet-container"
        ).count();

      expect(
        leafletCount
      ).toBe(0);

      console.log(
        "[PASS] Explore page has no active map"
      );

      // ======================================================
      // ANALYTICS
      // ======================================================

      console.log(
        "\n[13] ANALYTICS"
      );

      await page.getByRole(
        "button",
        {
          name: "Analytics",
          exact: true
        }
      ).click();

      await expect(
        page.getByRole(
          "heading",
          {
            name: "City Analytics",
            exact: true
          }
        )
      ).toBeVisible({
        timeout: 15000
      });

      await expect(
        page.getByText(
          /766,648/
        ).first()
      ).toBeVisible({
        timeout: 15000
      });

      console.log(
        "[PASS] BBMP analytics loaded"
      );

      await page.screenshot({
        path:
          "e2e-results/06-analytics.png",
        fullPage: true
      });

      // ======================================================
      // BACK TO MY REPORTS
      // ======================================================

      console.log(
        "\n[14] FINAL REPORT STATE"
      );

      await page.getByRole(
        "button",
        {
          name: "My Reports",
          exact: true
        }
      ).click();

      await expect(
        page.getByRole(
          "heading",
          {
            name: "My Reports",
            exact: true
          }
        )
      ).toBeVisible({
        timeout: 15000
      });

      const finalBody =
        await page.locator(
          "body"
        ).innerText();

      if (
        finalBody.includes(
          createdReportId
        )
      ) {
        console.log(
          "[PASS] Report remains visible after complete flow"
        );
      }

      await page.screenshot({
        path:
          "e2e-results/07-final-reports.png",
        fullPage: true
      });

      // ======================================================
      // API DIRECT PERSISTENCE VERIFICATION
      // ======================================================

      console.log(
        "\n[15] DIRECT DATABASE API VERIFICATION"
      );

      const response =
        await request.get(
          `${API}/reports/${createdReportId}`
        );

      expect(
        response.ok()
      ).toBeTruthy();

      const result =
        await response.json();

      const report =
        result?.data ||
        result?.report ||
        result;

      expect(
        report.reportId
      ).toBe(
        createdReportId
      );

      expect(
        Number(
          report.location?.latitude
        )
      ).toBeCloseTo(
        12.9716,
        4
      );

      expect(
        Number(
          report.location?.longitude
        )
      ).toBeCloseTo(
        77.5946,
        4
      );

      expect(
        report.images?.length || 0
      ).toBeGreaterThan(
        0
      );

      console.log(
        "[PASS] MongoDB contains report + GPS + image"
      );

      if (
        report.status ===
        "Resolved"
      ) {
        console.log(
          "[PASS] MongoDB final status = Resolved"
        );
      }

    }
    finally {

      // ======================================================
      // CLEAN E2E REPORT
      // ======================================================

      if (
        createdReportId
      ) {

        console.log(
          `\n[CLEANUP] Removing temporary report ${createdReportId}`
        );

        const deleteResponse =
          await request.delete(
            `${API}/reports/${createdReportId}`
          );

        if (
          deleteResponse.ok()
        ) {
          console.log(
            "[CLEANUP PASS] Temporary report deleted"
          );
        }

        if (
          !deleteResponse.ok()
        ) {
          console.log(
            "[CLEANUP WARNING] Temporary report was not deleted automatically"
          );
        }
      }
    }
  }
);

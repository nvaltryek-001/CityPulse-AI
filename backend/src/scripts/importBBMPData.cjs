require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { parse } = require("csv-parse");

const CivicDatasetRecord =
    require("../models/CivicDatasetRecord.js").default ||
    require("../models/CivicDatasetRecord.js");

const BACKEND_ROOT = process.cwd();
const DATA_DIR = path.join(
    BACKEND_ROOT,
    "data",
    "bbmp"
);

const MONGO_URI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/citypulse-ai";

const BATCH_SIZE = 500;

function clean(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}

function normalizeStatus(value) {

    const text = clean(value).toLowerCase();

    if (
        text.includes("closed") ||
        text.includes("resolved") ||
        text.includes("complete")
    ) {
        return "resolved";
    }

    if (
        text.includes("progress") ||
        text.includes("working") ||
        text.includes("assigned")
    ) {
        return "in-progress";
    }

    if (
        text.includes("reject") ||
        text.includes("invalid")
    ) {
        return "rejected";
    }

    return "open";
}

function makeRecord(row, year, rowNumber) {

    const complaintId =
        clean(row["Complaint ID"]) ||
        clean(row["ComplaintID"]) ||
        clean(row["complaint_id"]) ||
        `ROW-${rowNumber}`;

    const category =
        clean(row["Category"]) ||
        clean(row["category"]) ||
        "Other";

    const subCategory =
        clean(row["Sub Category"]) ||
        clean(row["SubCategory"]) ||
        clean(row["sub_category"]);

    const grievanceDate =
        clean(row["Grievance Date"]) ||
        clean(row["GrievanceDate"]) ||
        clean(row["grievance_date"]);

    const wardName =
        clean(row["Ward Name"]) ||
        clean(row["WardName"]) ||
        clean(row["ward_name"]);

    const grievanceStatus =
        clean(row["Grievance Status"]) ||
        clean(row["GrievanceStatus"]) ||
        clean(row["status"]);

    const staffRemarks =
        clean(row["Staff Remarks"]) ||
        clean(row["StaffRemarks"]) ||
        clean(row["remarks"]);

    const staffName =
        clean(row["Staff Name"]) ||
        clean(row["StaffName"]) ||
        clean(row["staff_name"]);

    const externalId =
        `BBMP-${year}-${complaintId}`;

    return {
        updateOne: {

            filter: {
                externalId,
                source: "BBMP"
            },

            update: {
                $set: {

                    externalId,

                    source: "BBMP",

                    sourceDataset:
                        `BBMP Grievances ${year}`,

                    category,

                    subCategory,

                    grievanceDate,

                    wardName,

                    status:
                        normalizeStatus(
                            grievanceStatus
                        ),

                    staffRemarks,

                    staffName,

                    location: {

                        address:
                            wardName,

                        wardName,

                        /*
                         * Historical BBMP dataset
                         * does not contain complaint GPS.
                         *
                         * DO NOT fabricate coordinates.
                         */

                        latitude: null,

                        longitude: null
                    },

                    importedAt:
                        new Date()
                }
            },

            upsert: true
        }
    };
}

async function importYear(year) {

    const filePath =
        path.join(
            DATA_DIR,
            `bbmp-grievances-${year}.csv`
        );

    console.log("");
    console.log(
        `========== BBMP ${year} ==========`
    );

    if (!fs.existsSync(filePath)) {

        console.log(
            `SKIPPED: ${filePath}`
        );

        return 0;
    }

    let rowNumber = 0;
    let batch = [];
    let imported = 0;

    const parser =
        fs
            .createReadStream(filePath)
            .pipe(
                parse({
                    columns: true,
                    bom: true,
                    skip_empty_lines: true,
                    relax_column_count: true,
                    trim: true
                })
            );

    for await (const row of parser) {

        rowNumber++;

        batch.push(
            makeRecord(
                row,
                year,
                rowNumber
            )
        );

        if (batch.length >= BATCH_SIZE) {

            await CivicDatasetRecord.bulkWrite(
                batch,
                {
                    ordered: false
                }
            );

            imported += batch.length;

            console.log(
                `${year}: ${imported.toLocaleString()} rows`
            );

            batch = [];
        }
    }

    if (batch.length > 0) {

        await CivicDatasetRecord.bulkWrite(
            batch,
            {
                ordered: false
            }
        );

        imported += batch.length;
    }

    console.log(
        `BBMP ${year} COMPLETE: ${imported.toLocaleString()}`
    );

    return imported;
}

async function main() {

    console.log("");
    console.log(
        "================================================"
    );
    console.log(
        " CITYPULSE AI — BBMP MONGODB IMPORT"
    );
    console.log(
        "================================================"
    );
    console.log("");

    await mongoose.connect(
        MONGO_URI
    );

    console.log(
        "MongoDB: CONNECTED"
    );

    const years = [
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025"
    ];

    const totals = {};

    for (const year of years) {

        totals[year] =
            await importYear(year);
    }

    const total =
        await CivicDatasetRecord.countDocuments({
            source: "BBMP"
        });

    const categories =
        await CivicDatasetRecord.aggregate([

            {
                $match: {
                    source: "BBMP"
                }
            },

            {
                $group: {
                    _id: "$category",
                    count: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    count: -1
                }
            },

            {
                $limit: 15
            }

        ]);

    const statuses =
        await CivicDatasetRecord.aggregate([

            {
                $match: {
                    source: "BBMP"
                }
            },

            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    count: -1
                }
            }

        ]);

    console.log("");
    console.log(
        "================================================"
    );
    console.log(
        " BBMP IMPORT SUCCESS"
    );
    console.log(
        "================================================"
    );

    console.log("");

    for (const year of years) {

        console.log(
            `${year}: ${totals[year].toLocaleString()}`
        );
    }

    console.log("");

    console.log(
        `TOTAL: ${total.toLocaleString()} BBMP RECORDS`
    );

    console.log("");
    console.log("TOP CATEGORIES:");

    for (const item of categories) {

        console.log(
            `  ${item._id || "Other"}: ${item.count.toLocaleString()}`
        );
    }

    console.log("");
    console.log("STATUS:");

    for (const item of statuses) {

        console.log(
            `  ${item._id}: ${item.count.toLocaleString()}`
        );
    }

    console.log("");
    console.log(
        "GPS: Historical BBMP coordinates NOT fabricated."
    );

    await mongoose.disconnect();

    console.log("");
    console.log(
        "MongoDB: DISCONNECTED"
    );
}

main().catch(async (error) => {

    console.error("");
    console.error(
        "BBMP IMPORT FAILED"
    );

    console.error(error);

    try {
        await mongoose.disconnect();
    } catch {}

    process.exit(1);
});

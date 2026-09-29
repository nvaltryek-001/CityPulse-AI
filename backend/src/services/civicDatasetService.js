import CivicDatasetRecord from "../models/CivicDatasetRecord.js";

function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

export async function listCivicDatasetRecords(query = {}) {

  const {
    category,
    subCategory,
    status,
    wardName,
    year,
    search,
    source = "BBMP",
    limit = 50
  } = query;

  const filter = {};

  if (source) {
    filter.source = source;
  }

  if (category) {
    filter.category = category;
  }

  if (subCategory) {
    filter.subCategory = subCategory;
  }

  if (status) {
    filter.status = status;
  }

  if (wardName) {
    filter.wardName = wardName;
  }

  if (year && /^\d{4}$/.test(String(year))) {
    filter.sourceDataset = `BBMP Grievances ${year}`;
  }

  if (search && String(search).trim()) {

    const regex = new RegExp(
      escapeRegex(String(search).trim()),
      "i"
    );

    filter.$or = [
      {
        category: regex
      },
      {
        subCategory: regex
      },
      {
        wardName: regex
      },
      {
        staffRemarks: regex
      },
      {
        staffName: regex
      }
    ];
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  return CivicDatasetRecord
    .find(filter)
    .sort({
      grievanceDate: -1,
      createdAt: -1
    })
    .limit(safeLimit)
    .lean();
}

export async function getCivicDatasetStats() {

  const [
    total,
    categories,
    subCategories,
    statuses,
    wards,
    years
  ] = await Promise.all([

    CivicDatasetRecord.countDocuments({
      source: "BBMP"
    }),

    CivicDatasetRecord.aggregate([
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
      }
    ]),

    CivicDatasetRecord.aggregate([
      {
        $match: {
          source: "BBMP"
        }
      },
      {
        $group: {
          _id: "$subCategory",
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
        $limit: 50
      }
    ]),

    CivicDatasetRecord.aggregate([
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
    ]),

    CivicDatasetRecord.aggregate([
      {
        $match: {
          source: "BBMP",
          wardName: {
            $nin: ["", null]
          }
        }
      },
      {
        $group: {
          _id: "$wardName",
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
        $limit: 50
      }
    ]),

    CivicDatasetRecord.aggregate([
      {
        $match: {
          source: "BBMP"
        }
      },
      {
        $group: {
          _id: "$sourceDataset",
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
  ]);

  const yearly = years.map((item) => ({
    year: String(item._id || "").replace(
      "BBMP Grievances ",
      ""
    ),
    count: Number(item.count) || 0
  }));

  return {
    total,
    categories,
    subCategories,
    statuses,
    wards,
    years: yearly
  };
}

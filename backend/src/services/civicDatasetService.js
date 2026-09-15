import CivicDatasetRecord from "../models/CivicDatasetRecord.js";

export async function listCivicDatasetRecords(query = {}) {
  const {
    category,
    status,
    wardName,
    source = "BBMP",
    limit = 100
  } = query;

  const filter = {};

  if (source) {
    filter.source = source;
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (wardName) {
    filter.wardName = wardName;
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    500
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
    statuses,
    wards
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
          _id: "$status",
          count: {
            $sum: 1
          }
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
    ])
  ]);

  return {
    total,
    categories,
    statuses,
    wards
  };
}
import mongoose from "mongoose";

const civicDatasetRecordSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true
    },

    source: {
      type: String,
      required: true,
      default: "BBMP"
    },

    sourceDataset: {
      type: String,
      required: true
    },

    category: {
      type: String,
      default: "Other"
    },

    subCategory: {
      type: String,
      default: ""
    },

    grievanceDate: {
      type: String,
      default: ""
    },

    wardName: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      default: "open"
    },

    staffRemarks: {
      type: String,
      default: ""
    },

    staffName: {
      type: String,
      default: ""
    },

    location: {
      address: {
        type: String,
        default: ""
      },

      wardName: {
        type: String,
        default: ""
      },

      latitude: {
        type: Number,
        default: null
      },

      longitude: {
        type: Number,
        default: null
      }
    },

    importedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

civicDatasetRecordSchema.index(
  {
    externalId: 1,
    source: 1
  },
  {
    unique: true
  }
);

civicDatasetRecordSchema.index({
  grievanceDate: 1
});

civicDatasetRecordSchema.index({
  source: 1,
  wardName: 1
});

export default mongoose.model(
  "CivicDatasetRecord",
  civicDatasetRecordSchema
);

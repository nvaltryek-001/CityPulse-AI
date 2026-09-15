import mongoose from "mongoose";

const civicDatasetRecordSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      index: true
    },

    source: {
      type: String,
      required: true,
      default: "BBMP",
      index: true
    },

    sourceDataset: {
      type: String,
      required: true
    },

    category: {
      type: String,
      default: "Other",
      index: true
    },

    subCategory: {
      type: String,
      default: ""
    },

    grievanceDate: {
      type: String,
      default: "",
      index: true
    },

    wardName: {
      type: String,
      default: "",
      index: true
    },

    status: {
      type: String,
      default: "open",
      index: true
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

civicDatasetRecordSchema.index({
  externalId: 1,
  source: 1
}, {
  unique: true
});

civicDatasetRecordSchema.index({
  source: 1,
  category: 1,
  status: 1
});

civicDatasetRecordSchema.index({
  source: 1,
  wardName: 1
});

export default mongoose.model(
  "CivicDatasetRecord",
  civicDatasetRecordSchema
);
import mongoose from "mongoose";

const civicGeoReportSchema =
  new mongoose.Schema(
    {

      reportId: {
        type: String,
        required: true,
        unique: true,
        index: true
      },

      title: {
        type: String,
        default: ""
      },

      description: {
        type: String,
        default: ""
      },

      category: {
        type: String,
        default: "Other",
        index: true
      },

      priority: {
        type: String,
        default: "medium",
        index: true
      },

      status: {
        type: String,
        default: "open",
        index: true
      },

      department: {
        type: String,
        default: ""
      },

      address: {
        type: String,
        default: ""
      },

      latitude: {
        type: Number,
        required: true
      },

      longitude: {
        type: Number,
        required: true
      },

      location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
          default: "Point"
        },

        coordinates: {
          type: [Number],
          required: true
        }
      },

      source: {
        type: String,
        default: "CITYPULSE",
        index: true
      },

      originalReportId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true
      },

      createdAt: {
        type: Date,
        default: Date.now,
        index: true
      }
    }
  );

civicGeoReportSchema.index({
  location: "2dsphere"
});

civicGeoReportSchema.index({
  category: 1,
  status: 1,
  createdAt: -1
});

export default mongoose.model(
  "CivicGeoReport",
  civicGeoReportSchema
);

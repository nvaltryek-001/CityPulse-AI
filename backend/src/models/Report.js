import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    category: {
      type: String,
      default: "Other",
      index: true
    },

    issueType: {
      type: String,
      default: "Other"
    },

    description: {
      type: String,
      default: ""
    },

    location: {
      address: {
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
      },

      accuracy: {
        type: Number,
        default: null
      },

      capturedAt: {
        type: Date,
        default: null
      }
    },

    severity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical"
      ],
      default: "Medium",
      index: true
    },

    trafficLevel: {
      type: String,
      default: "Medium"
    },

    safetyRisk: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },

    department: {
      type: String,
      default: "Municipal Services"
    },

    images: {
      type: [
        mongoose.Schema.Types.Mixed
      ],
      default: []
    },

    aiAnalysis: {
      detectedIssue: {
        type: String,
        default: ""
      },

      category: {
        type: String,
        default: "Other"
      },

      severity: {
        type: Number,
        default: 0
      },

      priority: {
        type: String,
        default: "Medium"
      },

      confidence: {
        type: Number,
        default: 0
      },

      observations: [
        {
          type: String
        }
      ],

      recommendation: {
        type: String,
        default: ""
      },

      department: {
        type: String,
        default: ""
      },

      evidenceQuality: {
        type: String,
        default: "Fair"
      },

      possibleDuplicate: {
        type: Boolean,
        default: false
      }
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "AI Analyzed",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected"
      ],
      default: "Submitted",
      index: true
    },

    source: {
      type: String,
      default: "CityPulse AI"
    },

    submittedFrom: {
      type: String,
      default: "web"
    },

    statusNote: {
      type: String,
      default: ""
    },

    statusUpdatedAt: {
      type: Date,
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({
  "location.latitude": 1,
  "location.longitude": 1
});

reportSchema.index({
  category: 1,
  status: 1,
  priority: 1
});

const Report =
  mongoose.models.Report ||
  mongoose.model(
    "Report",
    reportSchema
  );

export default Report;

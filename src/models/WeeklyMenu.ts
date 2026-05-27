import mongoose from "mongoose";

const menuDaySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
        "domingo",
      ],
    },

    recipeId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const weeklyMenuSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weekStart: {
      type: Date,
      required: true,
    },

    days: {
      type: [menuDaySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("WeeklyMenu", weeklyMenuSchema);
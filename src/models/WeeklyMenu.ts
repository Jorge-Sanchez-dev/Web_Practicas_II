import mongoose from "mongoose";

const menuMealSchema = new mongoose.Schema(
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

    mealType: {
      type: String,
      required: true,
      enum: ["desayuno", "comida", "cena"],
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

    meals: {
      type: [menuMealSchema],
      default: [],
    },
  },
  { timestamps: true }
);

weeklyMenuSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export default mongoose.model("WeeklyMenu", weeklyMenuSchema);
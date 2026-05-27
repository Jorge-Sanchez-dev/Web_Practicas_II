import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: String,
      default: "",
    },

    checked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const shoppingListSchema = new mongoose.Schema(
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

    items: {
      type: [shoppingItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShoppingList", shoppingListSchema);
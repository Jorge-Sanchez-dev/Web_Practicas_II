import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    edad: {
      type: Number,
    },

    sexo: {
      type: String,
      enum: ["hombre", "mujer", "otro"],
    },

    altura: {
      type: Number,
    },

    pesoActual: {
      type: Number,
    },

    pesoObjetivo: {
      type: Number,
    },

    nivelActividad: {
      type: String,
      enum: ["sedentario", "ligero", "moderado", "intenso"],
    },

    objetivo: {
      type: String,
      enum: ["perder peso", "mantener peso", "ganar peso"],
    },

    fotoPerfil: {
      type: String,
      default: "",
    },

    historialPeso: [
      {
        fecha: {
          type: Date,
          default: Date.now,
        },

        peso: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
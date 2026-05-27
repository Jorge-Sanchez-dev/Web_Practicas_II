import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    edad: { type: Number, required: true },
    sexo: { type: String, required: true },
    altura: { type: Number, required: true },
    pesoActual: { type: Number, required: true },
    pesoObjetivo: { type: Number, required: true },
    nivelActividad: { type: String, required: true },
    objetivo: { type: String, required: true },

    fotoPerfil: { type: String, default: "" },
    historialPeso: { type: [Number], default: [] },
  },
  { timestamps: true }
);
  

export default mongoose.model("User", userSchema);
import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SPOONACULAR_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// CONEXIÓN A MONGODB
mongoose
  .connect(MONGODB_URI as string)
  .then(() => console.log("MongoDB conectado correctamente"))
  .catch((error) => console.error("Error conectando MongoDB:", error));

// REGISTRO
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      edad,
      sexo,
      altura,
      pesoActual,
      pesoObjetivo,
      nivelActividad,
      objetivo,
      fotoPerfil,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !edad ||
      !sexo ||
      !altura ||
      !pesoActual ||
      !pesoObjetivo ||
      !nivelActividad ||
      !objetivo
    ) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Las contraseñas no coinciden",
      });
    }

    if (Number(edad) <= 0) {
      return res.status(400).json({
        error: "La edad debe ser mayor que 0",
      });
    }

    if (Number(altura) <= 0) {
      return res.status(400).json({
        error: "La altura debe ser mayor que 0",
      });
    }

    if (Number(pesoActual) <= 0 || Number(pesoObjetivo) <= 0) {
      return res.status(400).json({
        error: "El peso debe ser mayor que 0",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "Ese correo ya está registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      edad: Number(edad),
      sexo,
      altura: Number(altura),
      pesoActual: Number(pesoActual),
      pesoObjetivo: Number(pesoObjetivo),
      nivelActividad,
      objetivo,

      fotoPerfil: fotoPerfil || "",
      historialPeso: [Number(pesoActual)],
    });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        edad: user.edad,
        sexo: user.sexo,
        altura: user.altura,
        pesoActual: user.pesoActual,
        pesoObjetivo: user.pesoObjetivo,
        nivelActividad: user.nivelActividad,
        objetivo: user.objetivo,
        fotoPerfil: user.fotoPerfil,
        historialPeso: user.historialPeso,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({
      error: "Error al registrar usuario",
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Correo y contraseña son obligatorios",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      message: "Inicio de sesión correcto",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      error: "Error al iniciar sesión",
    });
  }
});

// RECETAS
app.get("/api/recipes", async (req, res) => {
  try {
    const query = req.query.query;
    const number = Number(req.query.number) || 39;

    let url = "";

    if (query) {
      url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
        String(query),
      )}&number=${number}&apiKey=${API_KEY}`;
    } else {
      url = `https://api.spoonacular.com/recipes/random?number=${number}&apiKey=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Error al obtener recetas desde Spoonacular",
      });
    }

    const recipes = query ? data.results : data.recipes;

    if (!Array.isArray(recipes)) {
      return res.status(500).json({
        error: "La API no devolvió recetas en formato correcto",
      });
    }

    const formattedRecipes = recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
    }));

    return res.json({ results: formattedRecipes });
  } catch (error) {
    console.error("Error obteniendo recetas:", error);
    return res.status(500).json({
      error: "Error obteniendo recetas",
    });
  }
});

// DETALLE DE RECETA
app.get("/api/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Error obteniendo detalle de receta",
      });
    }

    const ingredients =
      data.extendedIngredients?.map((ing: any) => ing.original) || [];

    const steps =
      data.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) ||
      [];

    return res.json({
      id: data.id,
      title: data.title,
      image: data.image,
      ingredients,
      steps,
    });
  } catch (error) {
    console.error("Error en detalle receta:", error);
    return res.status(500).json({
      error: "Error obteniendo receta",
    });
  }
});

// RUTA FINAL PARA HTML
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ShoppingList from "./models/ShoppingList";
import SavedRecipe from "./models/SavedRecipe";

import User from "./models/User";
import WeeklyMenu from "./models/WeeklyMenu";

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

// MIDDLEWARE AUTH
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

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

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 6 caracteres, una letra y un símbolo.",
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
      historialPeso: [
        {
          peso: Number(pesoActual),
          fecha: new Date(),
        },
      ],
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

// USUARIO ACTUAL
app.get("/api/auth/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
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

// OBTENER MENÚ SEMANAL
app.get("/api/weekly-menu", authMiddleware, async (req: any, res) => {
  try {
    const { weekStart } = req.query;

    if (!weekStart) {
      return res.status(400).json({ error: "Falta weekStart" });
    }

    const menu = await WeeklyMenu.findOne({
      userId: req.userId,
      weekStart: new Date(weekStart as string),
    });

    return res.json({
      meals: menu ? menu.meals : [],
    });
  } catch (error) {
    console.error("Error obteniendo el menú semanal:", error);
    return res.status(500).json({
      error: "Error obteniendo el menú semanal",
    });
  }
});

// GUARDAR RECETA EN MENÚ SEMANAL
app.post("/api/weekly-menu", authMiddleware, async (req: any, res) => {
  try {
    const { weekStart, day, mealType, recipeId, title, image } = req.body;

    if (!weekStart || !day || !mealType || !recipeId || !title) {
      return res.status(400).json({
        error: "Faltan datos para guardar la receta en el menú",
      });
    }

    const newMeal = {
      day,
      mealType,
      recipeId,
      title,
      image: image || "",
    };

    let menu = await WeeklyMenu.findOne({
      userId: req.userId,
      weekStart: new Date(weekStart),
    });

    if (!menu) {
      menu = await WeeklyMenu.create({
        userId: req.userId,
        weekStart: new Date(weekStart),
        meals: [newMeal],
      });

      return res.status(201).json(menu);
    }

    const index = menu.meals.findIndex(
      (meal: any) => meal.day === day && meal.mealType === mealType,
    );

    const replace = req.body.replace === true;

    if (index !== -1 && !replace) {
      return res.status(409).json({
        error: "Ya existe una receta en ese hueco del menú",
        message: "¿Quieres reemplazar la receta existente?",
        existingMeal: menu.meals[index],
      });
    }

    if (index !== -1 && replace) {
      menu.meals[index].day = day;
      menu.meals[index].mealType = mealType;
      menu.meals[index].recipeId = recipeId;
      menu.meals[index].title = title;
      menu.meals[index].image = image || "";
    } else {
      menu.meals.push(newMeal as any);
    }

    await menu.save();

    return res.json(menu);
  } catch (error) {
    console.error("Error guardando el menú semanal:", error);
    return res.status(500).json({
      error: "Error guardando el menú semanal",
    });
  }
});

// OBTENER LISTA DE LA COMPRA DE LA SEMANA ACTUAL
app.get("/api/shopping-list", authMiddleware, async (req: any, res) => {
  try {
    const { weekStart } = req.query;

    if (!weekStart) {
      return res.status(400).json({ error: "Falta weekStart" });
    }

    const menu = await WeeklyMenu.findOne({
      userId: req.userId,
      weekStart: new Date(weekStart as string),
    });

    if (!menu || menu.meals.length === 0) {
      return res.json({ items: [] });
    }

    const ingredientSet = new Set<string>();

    for (const meal of menu.meals) {
      const url = `https://api.spoonacular.com/recipes/${meal.recipeId}/information?apiKey=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      const ingredients =
        data.extendedIngredients?.map((ing: any) => ing.original) || [];

      ingredients.forEach((ingredient: string) => {
        ingredientSet.add(ingredient);
      });
    }

    const items = Array.from(ingredientSet).map((ingredient) => ({
      name: ingredient,
      quantity: "",
      checked: false,
    }));

    return res.json({ items });
  } catch (error) {
    console.error("Error generando lista de la compra:", error);
    return res.status(500).json({
      error: "Error generando lista de la compra",
    });
  }
});

// GUARDAR RECETA
app.post("/api/saved-recipes", authMiddleware, async (req: any, res) => {
  try {
    const { recipeId, title, image } = req.body;

    if (!recipeId || !title) {
      return res.status(400).json({ error: "Faltan datos de la receta" });
    }

    const existingRecipe = await SavedRecipe.findOne({
      userId: req.userId,
      recipeId,
    });

    if (existingRecipe) {
      return res.status(409).json({ error: "La receta ya está guardada" });
    }

    const savedRecipe = await SavedRecipe.create({
      userId: req.userId,
      recipeId,
      title,
      image: image || "",
    });

    return res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error guardando receta:", error);
    return res.status(500).json({ error: "Error guardando receta" });
  }
});

// OBTENER RECETAS GUARDADAS
app.get("/api/saved-recipes", authMiddleware, async (req: any, res) => {
  try {
    const recipes = await SavedRecipe.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({ recipes });
  } catch (error) {
    console.error("Error obteniendo recetas guardadas:", error);
    return res
      .status(500)
      .json({ error: "Error obteniendo recetas guardadas" });
  }
});

// ELIMINAR RECETA GUARDADA
app.delete(
  "/api/saved-recipes/:recipeId",
  authMiddleware,
  async (req: any, res) => {
    try {
      await SavedRecipe.findOneAndDelete({
        userId: req.userId,
        recipeId: Number(req.params.recipeId),
      });

      return res.json({ message: "Receta eliminada correctamente" });
    } catch (error) {
      console.error("Error eliminando receta:", error);
      return res.status(500).json({ error: "Error eliminando receta" });
    }
  },
);

// RUTA FINAL PARA HTML
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

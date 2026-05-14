import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DB_PATH = path.join(process.cwd(), "db.json");

  app.use(express.json());

  // Helper to read DB
  const readDB = () => {
    try {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      return { plants: [] };
    }
  };

  // Helper to write DB
  const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  };

  // API Routes
  app.get("/api/plants", (req, res) => {
    const db = readDB();
    res.json(db.plants);
  });

  app.post("/api/plants", (req, res) => {
    const db = readDB();
    const newPlant = {
      ...req.body,
      id: db.plants.length > 0 ? Math.max(...db.plants.map((p) => p.id)) + 1 : 1,
      inStock: true
    };
    db.plants.push(newPlant);
    writeDB(db);
    res.status(201).json(newPlant);
  });

  app.patch("/api/plants/:id", (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const index = db.plants.findIndex((p) => p.id === id);
    if (index !== -1) {
      db.plants[index] = { ...db.plants[index], ...req.body };
      writeDB(db);
      res.json(db.plants[index]);
    } else {
      res.status(404).json({ error: "Plant not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

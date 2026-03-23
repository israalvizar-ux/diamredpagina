import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://israalvizar-ux.github.io";

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === ALLOWED_ORIGIN || origin.startsWith("http://127.0.0.1") || origin.startsWith("http://localhost")) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido"));
    }
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/encuesta", async (req, res) => {
  try {
    if (!DISCORD_WEBHOOK_URL) {
      return res.status(500).json({ error: "Falta DISCORD_WEBHOOK_URL en el servidor" });
    }

    const {
      nombre = "No especificado",
      clave = "No especificado",
      preferencias = [],
      edad = "No especificado",
      lugar = "pagina personal",
      donde = "No especificado",
      comentario = "Sin comentarios"
    } = req.body || {};

    const preferenciasTexto = Array.isArray(preferencias) && preferencias.length > 0
      ? preferencias.join(", ")
      : "No especificado";

    const mensaje = [
      "Nueva encuesta enviada:",
      `Nombre: ${nombre}`,
      `Peso (KG): ${clave}`,
      `Preferencia sexual: ${preferenciasTexto}`,
      `Edad: ${edad}`,
      `Lugar: ${lugar}`,
      `Como encontraste mi pagina: ${donde}`,
      `Comentarios: ${comentario}`
    ].join("\n");

    const discordResp = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: mensaje })
    });

    if (!discordResp.ok) {
      const errorText = await discordResp.text();
      return res.status(502).json({ error: "Error de Discord", detail: errorText });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Error interno" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listo en puerto ${PORT}`);
});

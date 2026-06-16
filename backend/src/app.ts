import express from "express";
import cors from "cors";
import routes from "./routes/index.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API EduOrienta Judá funcionando correctamente",
  });
});

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
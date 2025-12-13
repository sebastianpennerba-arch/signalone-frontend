import express from "express";
import cors from "cors";
import { config } from "./config.js";

import metaRoutes from "./routes/meta.js";
import dashboardRoutes from "./routes/dashboard.js";
import campaignsRoutes from "./routes/campaigns.js";
import creativesRoutes from "./routes/creatives.js";
import testingRoutes from "./routes/testing.js";
import senseiRoutes from "./routes/sensei.js";
import brandsRoutes from "./routes/brands.js";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.use("/api/meta", metaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/creatives", creativesRoutes);
app.use("/api/testing", testingRoutes);
app.use("/api/sensei", senseiRoutes);
app.use("/api/brands", brandsRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(config.port, () => {
  console.log(`SignalOne API running on port ${config.port}`);
});

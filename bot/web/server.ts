/* ============================================================
   R7 Wellness — Web Dev Server (No Telegram needed)
   Test the full product flow in your browser at localhost:3000
   ============================================================ */

import express from "express";
import {
  generateChatResponse,
  generateCompanionResponse,
  generateProductReport,
  type ProductReportType,
} from "../services/ai-generator.js";
import { createPaymentLink, type ReportType } from "../services/payments.js";

const app = express();
app.use(express.json());
app.use(express.static("web/public"));

// ---- API Endpoints ----

// Chat: AI conversation
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });
  try {
    const response = await generateChatResponse(message, history || []);
    res.json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

// Generic product report: Mood, Work, Body-Mind, Dream Journal, etc.
app.post("/api/report", async (req, res) => {
  const { reportType, gender } = req.body;
  const allowed = [
    "emotional-depth",
    "dream-emotion",
    "career-meaning",
    "body-emotion-balance",
    "inner-richness-personality",
    "relationship-emotional-growth",
  ];
  if (!allowed.includes(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }
  if (!gender) {
    return res.status(400).json({ error: "Missing gender" });
  }

  try {
    const sections = await generateProductReport({
      reportType: reportType as ProductReportType,
      name: req.body.name || "Private Guest",
      gender: req.body.gender,
      country: req.body.country,
      focus: req.body.focus,
      relationshipContext: req.body.relationshipContext,
      answers: req.body.answers,
    });
    res.json({ sections });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Report generation failed" });
  }
});

app.post("/api/companion", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const response = await generateCompanionResponse({
      message,
      reportType: req.body.reportType,
      reportTitle: req.body.reportTitle,
      sectionSummary: req.body.sectionSummary,
      turn: req.body.turn,
    });
    res.json({ response });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Companion failed" });
  }
});

// Payment Link: one-time report checkout
app.post("/api/payment-link", async (req, res) => {
  const { reportType } = req.body;
  const allowed = [
    "emotional-depth",
    "dream-emotion",
    "career-meaning",
    "body-emotion-balance",
    "inner-richness-personality",
    "relationship-emotional-growth",
  ];
  if (!allowed.includes(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }

  try {
    const payment = await createPaymentLink({
      chatId: 0,
      reportType: reportType as ReportType,
    });

    if (!payment) {
      return res.status(500).json({ error: "Payment link unavailable" });
    }

    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Payment link failed" });
  }
});

// ---- Start ----
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🌿 R7 Wellness Web Dev Server`);
  console.log(`   Open: http://localhost:${PORT}\n`);
});

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "10mb" }));
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    try {
      ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      console.log("Gemini SDK initialized successfully with API key.");
    } catch (e) {
      console.error("Error initializing Gemini SDK:", e);
    }
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not set in environment.");
  }
  app.get("/api/status", (req, res) => {
    res.json({
      status: "online",
      hasApiKey: !!apiKey,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/send-otp", async (req, res) => {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ error: "Email and otpCode are required." });
    }
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"sefaGPT Security" <noreply@sefagpt.ai>`;
    if (!host || !port || !user || !pass) {
      console.warn("SMTP credentials are not fully configured. Falling back to simulator mode.");
      return res.json({
        success: true,
        smtpConfigured: false,
        message: "SMTP is not configured in secrets. Displaying code in simulator mode."
      });
    }
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: parseInt(port, 10) === 465,
        // true for 465, false for other ports
        auth: {
          user,
          pass
        }
      });
      const mailOptions = {
        from,
        to: email,
        subject: `[sefaGPT] Secure Identity Verification Code: ${otpCode}`,
        text: `Your 6-digit verification code is: ${otpCode}

This code will expire in 10 minutes. If you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d0d0d; color: #e0e0e0; padding: 40px; text-align: center; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #333;">
            <div style="margin-bottom: 30px;">
              <span style="font-size: 24px; font-weight: bold; font-family: serif; font-style: italic; color: #fff; letter-spacing: -0.5px;">sefaGPT</span>
            </div>
            <h2 style="color: #fff; font-size: 20px; font-weight: 500; margin-bottom: 10px;">Security Verification</h2>
            <p style="color: #888; font-size: 14px; margin-bottom: 30px; line-height: 1.5;">Please use the 6-digit verification passcode below to authorize your secure workspace container:</p>
            <div style="background-color: #161616; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px 25px; display: inline-block; margin-bottom: 30px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 6px;">${otpCode}</span>
            </div>
            <p style="color: #555; font-size: 11px; margin-top: 20px;">This email was automatically dispatched from your sefaGPT isolated developer sandbox. If you did not request this verification, please secure your account credentials.</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
      console.log(`Successfully dispatched real OTP email to ${email}`);
      return res.json({
        success: true,
        smtpConfigured: true,
        message: "Verification email sent successfully."
      });
    } catch (error) {
      console.error("Nodemailer failed to dispatch email:", error);
      return res.status(500).json({
        error: "Failed to dispatch email. Please check your SMTP configuration or try again.",
        details: error.message
      });
    }
  });
  app.post("/api/chat", async (req, res) => {
    const { messages, model, systemInstruction, temperature, webSearch } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' format. Must be an array." });
    }
    const modelName = model || "gemini-3.5-flash";
    if (modelName === "max") {
      const blackboxApiKey = process.env.BLACKBOX_API_KEY || "YOUR_BLACKBOX_API_KEY_HERE";
      try {
        const blackboxMessages = [];
        if (systemInstruction && systemInstruction.trim()) {
          blackboxMessages.push({
            role: "system",
            content: systemInstruction.trim()
          });
        }
        messages.forEach((msg) => {
          blackboxMessages.push({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content
          });
        });
        console.log(`Sending prompt to Blackbox AI (Max) using model: blackboxai`);
        const bBoxResponse = await fetch("https://api.blackbox.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${blackboxApiKey}`
          },
          body: JSON.stringify({
            messages: blackboxMessages,
            model: "blackboxai",
            temperature: typeof temperature === "number" ? temperature : 0.7,
            max_tokens: 4096
          })
        });
        if (!bBoxResponse.ok) {
          const errorText = await bBoxResponse.text();
          throw new Error(`Blackbox API responded with status ${bBoxResponse.status}: ${errorText}`);
        }
        const bBoxData = await bBoxResponse.json();
        const replyText = bBoxData.choices?.[0]?.message?.content || "";
        return res.json({
          text: replyText,
          groundingMetadata: null
        });
      } catch (error) {
        console.error("Blackbox API call failed:", error);
        return res.status(500).json({
          error: error.message || "An unexpected error occurred during Blackbox message generation."
        });
      }
    }
    if (!ai) {
      return res.status(500).json({
        error: "Gemini AI server is not configured or is missing an API key. Please check the Secrets panel in AI Studio."
      });
    }
    const contents = messages.map((msg) => {
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      };
    });
    try {
      const config = {
        temperature: typeof temperature === "number" ? temperature : 0.7
      };
      if (systemInstruction && systemInstruction.trim()) {
        config.systemInstruction = systemInstruction.trim();
      }
      if (webSearch) {
        config.tools = [{ googleSearch: {} }];
      }
      console.log(`Sending prompt to Gemini using model: ${modelName}, webSearch: ${!!webSearch}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config
      });
      const replyText = response.text || "";
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
      res.json({
        text: replyText,
        groundingMetadata
      });
    } catch (error) {
      console.error("Gemini API call failed:", error);
      res.status(500).json({
        error: error.message || "An unexpected error occurred during message generation."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`sefaGPT backend listening on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map

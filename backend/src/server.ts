// =============================================================================
// AppLora Server — Express + Vite
// Consumer-first Digital Home Locker
//
// API Routes:
//   /api/users/*            — Users CRUD
//   /api/homes/*            — Homes CRUD
//   /api/appliances/*       — Appliances CRUD (with populated data)
//   /api/warranties/*       — Warranties CRUD
//   /api/documents/*        — Documents CRUD
//   /api/service-records/*  — Service Records CRUD
//   /api/ownership-records/* — Ownership Records CRUD
//   /api/dashboard          — Dashboard aggregate
//   /api/scan-bill          — AI OCR (kept, optional)
//   /api/ai-chat            — AI Chat (kept, optional)
// =============================================================================

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// Route modules
import usersRouter from './modules/users/routes.js';
import homesRouter from './modules/homes/routes.js';
import appliancesRouter from './modules/appliances/routes.js';
import warrantiesRouter from './modules/warranties/routes.js';
import documentsRouter from './modules/documents/routes.js';
import serviceRecordsRouter from './modules/services/routes.js';
import ownershipRecordsRouter from './modules/ownership/routes.js';

// Module stores & helpers
import { homes } from './modules/homes/store.js';
import { appliances } from './modules/appliances/store.js';
import { warranties } from './modules/warranties/store.js';
import { computeWarrantyStatus } from './modules/warranties/helpers.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

  app.use(cors());
  app.use(express.json({ limit: '20mb' }));

  // =========================================================================
  // Core CRUD API Routes
  // =========================================================================
  app.use('/api/users', usersRouter);
  app.use('/api/homes', homesRouter);
  app.use('/api/appliances', appliancesRouter);
  app.use('/api/warranties', warrantiesRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/service-records', serviceRecordsRouter);
  app.use('/api/ownership-records', ownershipRecordsRouter);

  // =========================================================================
  // Dashboard Aggregate Endpoint
  // =========================================================================
  app.get('/api/dashboard', (req, res) => {
    const { userId } = req.query;

    // Get homes for user
    const userHomes = Array.from(homes.values()).filter(
      (h) => !userId || h.userId === userId
    );

    const homeIds = new Set(userHomes.map((h) => h.id));

    // Get appliances for these homes
    const userAppliances = Array.from(appliances.values()).filter((a) =>
      homeIds.has(a.homeId)
    );

    // Compute warranty stats
    let activeWarranties = 0;
    let expiringWarranties = 0;
    let expiredWarranties = 0;
    let totalAssetValue = 0;

    const appliancesWithWarranty = userAppliances.map((app) => {
      const warranty = Array.from(warranties.values()).find(
        (w) => w.applianceId === app.id
      );

      totalAssetValue += app.purchasePrice || 0;

      if (warranty) {
        const status = computeWarrantyStatus(warranty);
        if (status === 'active') activeWarranties++;
        else if (status === 'expiring') expiringWarranties++;
        else expiredWarranties++;

        return {
          ...app,
          warranty: { ...warranty, status },
        };
      }

      return { ...app, warranty: null };
    });

    res.json({
      success: true,
      data: {
        homes: userHomes,
        totalAppliances: userAppliances.length,
        activeWarranties,
        expiringWarranties,
        expiredWarranties,
        totalAssetValue,
        appliances: appliancesWithWarranty,
      },
    });
  });

  // =========================================================================
  // AI Routes (kept from original — optional, require GEMINI_API_KEY)
  // =========================================================================
  try {
    const { GoogleGenAI, Type } = await import('@google/genai');

    const getAiClient = () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY not found in environment variables.');
      }
      return new GoogleGenAI({
        apiKey: apiKey || '',
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });
    };

    // OCR Bill Scanner
    app.post('/api/scan-bill', async (req, res) => {
      try {
        const { imageBase64, textContent, mimeType = 'image/jpeg' } = req.body;

        // Check if API key is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
          return res.status(503).json({
            success: false,
            error: 'AI OCR service is not configured. Please add GEMINI_API_KEY to backend/.env file. Get your API key from https://aistudio.google.com/app/apikey'
          });
        }

        const ai = getAiClient();

        let parts: any[] = [];

        if (imageBase64) {
          // Strip data URL prefix if present (e.g., "data:application/pdf;base64,")
          const cleanBase64 = imageBase64.replace(/^data:\w+\/\w+;base64,/, '');
          parts.push({
            inlineData: { data: cleanBase64, mimeType },
          });
        }

        const promptText = `
You are Applora AI's Document & Bill OCR Scanner.
Analyze the provided home appliance purchase receipt, invoice, or warranty card text/image using Natural Language Processing (NLP).
Different retailers (Croma, Reliance Digital, Vijay Sales, Amazon, local stores) and brands use varied invoice layouts, terminology, and branding styles.

DECOMPOSITION RULE:
If the invoice lists the product as a single combined title (e.g., "Lumio Vision 7 109 cm (43 inches) 4K Ultra-HD Smart QLED Google TV FTW1-ADSG"), ALWAYS split it into:
- brand: only the brand/manufacturer name (e.g., "Lumio").
- modelNumber: only the exact model code/series (e.g., "FTW1-ADSG").
- nameHint: a short human-readable product name from the title (optional, for context).

Extract and normalize structured metadata into JSON format:
- brand: string (Manufacturer/brand only, e.g., "Samsung", "LG", "Daikin", "Lumio").
- modelNumber: string (Exact model code/series only, e.g. "AR18CY5AMWK", "FTW1-ADSG", "KD-55X74K").
- serialNumber: string (Serial number if present; often labeled as "Serial No", "S/N", or near model. Also scan for barcodes, QR codes, or barcode values/numbers printed on the document or warranty card, decrypting/extracting that number as the serialNumber).
- purchaseDate: string (Format YYYY-MM-DD; use Invoice Date or Order Date if purchase date is absent).
- purchasePrice: number (Final invoice total amount actually paid by the customer after all discounts/offers; use "Invoice Value", "Grand Total", or "Total Amount").
- dealerName: string (Store, marketplace, or seller name; for Amazon use "Amazon" or the sold-by entity).
- category: string (MUST be one of: "AC / HVAC", "Refrigerator", "Washing Machine", "RO / Water Purifier", "Microwave & Oven", "Water Heater / Geyser", "TV & Entertainment", "Inverter & Battery", "Mixer & Kitchen", "Other").
- warrantyDurationMonths: number (Total warranty in months, e.g. 12, 24, 36).
- summaryTerms: string (Summary of warranty coverage terms).
- confidenceScore: number (0-100 score).

CRITICAL INSTRUCTION:
DO NOT guess or invent default fallback values. If a field is not present or unreadable in the invoice, return an empty string "" or 0 for that field.

Text / Document Content: ${textContent || 'Analyze the attached invoice image.'}`;

        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                brand: { type: Type.STRING },
                modelNumber: { type: Type.STRING },
                serialNumber: { type: Type.STRING },
                purchaseDate: { type: Type.STRING },
                purchasePrice: { type: Type.NUMBER },
                dealerName: { type: Type.STRING },
                category: { type: Type.STRING },
                warrantyDurationMonths: { type: Type.NUMBER },
                summaryTerms: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
              },
            },
          },
        });

        res.json({ success: true, data: JSON.parse(response.text || '{}') });
      } catch (error: any) {
        console.error('Error in /api/scan-bill:', error);

        // Provide more helpful error messages
        let errorMessage = 'OCR scan failed';
        if (error.message?.includes('API key') || error.message?.includes('authentication') || error.message?.includes('PERMISSION_DENIED')) {
          errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY in backend/.env';
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        res.status(500).json({ success: false, error: errorMessage });
      }
    });

    // AI Chat
    app.post('/api/ai-chat', async (req, res) => {
      try {
        const { userMessage, applianceContext, chatHistory = [] } = req.body;

        // Check if API key is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
          return res.status(503).json({
            success: false,
            reply: 'AI chat is not configured. Please add GEMINI_API_KEY to backend/.env file.'
          });
        }

        const ai = getAiClient();

        const systemInstruction = `
You are Applora AI, the intelligent companion for home appliances.
Help homeowners diagnose issues, answer warranty questions, troubleshoot faults.
Appliance context: ${applianceContext ? JSON.stringify(applianceContext, null, 2) : 'General query.'}`;

        const promptMessages = [
          ...chatHistory.map((m: any) => `${m.sender === 'user' ? 'User' : 'Applora AI'}: ${m.text}`),
          `User: ${userMessage}`,
        ].join('\n\n');

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptMessages,
          config: { systemInstruction },
        });

        res.json({ success: true, reply: response.text || 'Analysis complete.' });
      } catch (error: any) {
        console.error('Error in /api/ai-chat:', error);
        res.status(500).json({ success: false, reply: 'AI is currently unavailable.' });
      }
    });

    console.log('✓ AI routes loaded (scan-bill, ai-chat)');
  } catch (err) {
    console.warn('⚠ AI routes not loaded (missing @google/genai or GEMINI_API_KEY)');
  }

  // Vite middleware removed since this is now a standalone API server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🏠 AppLora Server running on http://localhost:${PORT}`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   GET    /api/dashboard?userId=`);
    console.log(`   CRUD   /api/users`);
    console.log(`   CRUD   /api/homes`);
    console.log(`   CRUD   /api/appliances`);
    console.log(`   CRUD   /api/warranties`);
    console.log(`   CRUD   /api/documents`);
    console.log(`   CRUD   /api/service-records`);
    console.log(`   CRUD   /api/ownership-records\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

# OCR AI Feature Setup Guide

The OCR bill scanning feature requires a Google Gemini API key. Follow these steps to enable it:

## 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key

## 2. Configure the Backend

1. Open `backend/.env` file
2. Replace `your_api_key_here` with your actual Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
PORT=3001
NODE_ENV=development
```

3. Save the file
4. Restart the backend server

## 3. Verify Setup

When you start the backend server, you should see:
```
✓ AI routes loaded (scan-bill, ai-chat)
```

If you see:
```
⚠ AI routes not loaded (missing @google/genai or GEMINI_API_KEY)
```

This means either:
- The API key is not set in `.env`
- The `@google/genai` package is not installed

## 4. Install Dependencies (if needed)

If the AI routes failed to load due to missing package:

```bash
cd backend
npm install @google/genai
```

## 5. Test the Feature

1. Open the app in your browser
2. Go to "Add Appliance" or "Scan Bill" modal
3. Upload an invoice image (JPG, PNG, or PDF)
4. Click "Scan Document & Extract Details"
5. The AI should extract brand, model, price, warranty details, etc.

## Supported Invoice Formats

- **Retailers**: Croma, Reliance Digital, Vijay Sales, Amazon, local stores
- **Brands**: Samsung, LG, Daikin, Lumio, Sony, IFB, etc.
- **Formats**: JPG, PNG, PDF invoices
- **Languages**: English invoices (works best with printed invoices)

## Important Notes

- The AI extracts **structured data** from invoices automatically
- **Brand and Model** are always split (e.g., "Lumio Vision 7..." → Brand: "Lumio", Model: "FTW1-ADSG")
- If a field is unreadable, it returns empty string or 0 (no guessing)
- **Do not** share your API key publicly or commit it to git

## Troubleshooting

**Error: "AI OCR service is not configured"**
- Check that `GEMINI_API_KEY` is set in `backend/.env`
- Restart the backend server after changing `.env`

**Error: "Invalid API key"**
- Verify your API key from https://aistudio.google.com/app/apikey
- Make sure there are no extra spaces in the `.env` file

**Error: "API quota exceeded"**
- You've hit the free tier limit
- Wait for quota to reset or upgrade your Google AI plan

## Cost

Google Gemini API has a free tier:
- **Free**: 15 requests per minute, 1500 requests per day
- **Paid**: $0.035 per 1K tokens (very affordable for personal use)

For typical invoice scanning (1-2 requests per appliance), the free tier is sufficient for most users.
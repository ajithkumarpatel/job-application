# Gemini Job Dashboard

An AI-powered personal job assistant. Upload your résumé to get skill analysis, find relevant job matches, and generate tailored cover letters instantly with the power of Gemini.

---

## 🚀 Deployment & Setup Instructions

You are seeing the `Firebase: Error (auth/invalid-api-key)` error because your API keys are not configured. **For your security, never share your secret keys or commit them to your code.**

Follow these steps to set up your keys securely.

### 1. Find Your API Keys

You will need two sets of keys:

-   **Firebase Keys:**
    1.  Go to your [Firebase Console](https://console.firebase.google.com/).
    2.  Select your project (`bubududu-chat-4811c`).
    3.  Click the **gear icon ⚙️** next to "Project Overview" and select **Project settings**.
    4.  Under the **General** tab, scroll down to "Your apps" and select the **Web app**.
    5.  In the "Firebase SDK snippet" section, select **Config**. You will find the `firebaseConfig` object which contains all the keys you need (`apiKey`, `authDomain`, etc.).

-   **Gemini API Key:**
    1.  Go to [Google AI Studio](https://aistudio.google.com/).
    2.  Click on **"Get API key"** in the left menu.
    3.  Create and copy your API key.

### 2. Local Development Setup

To run the app on your local machine, you need to create a file to store your keys.

1.  In the root of your project, create a new file named `.env.local`
2.  Copy the contents of `.env.example` into your new `.env.local` file.
3.  Replace the placeholder values with your **actual** keys from Step 1.

Your `.env.local` file should look like this (but with your real keys):
```
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY="AIzaSy...your-key"
REACT_APP_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
REACT_APP_FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
REACT_APP_FIREBASE_PROJECT_ID="your-project-id"
REACT_APP_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="1234567890"
REACT_APP_FIREBASE_APP_ID="1:12345:web:abcdef123"

# Gemini API Key
REACT_APP_GEMINI_API_KEY="AIzaSy...your-gemini-key"
```
**Important:** Your build tool (like Create React App or Vite) needs to be configured to read these `REACT_APP_` variables.

### 3. Vercel Deployment Setup

When you deploy to Vercel, you must add your keys to the Vercel project settings. This is the most important step.

1.  Push your code to GitHub and connect the repository to Vercel.
2.  In your Vercel project dashboard, go to the **Settings** tab.
3.  Click on **Environment Variables** in the left menu.
4.  Add each key-value pair from your `.env.local` file one by one.
    -   The **Name** is the variable name (e.g., `REACT_APP_FIREBASE_API_KEY`).
    -   The **Value** is your secret key (e.g., `AIzaSy...your-key`).
5.  After adding all the variables, go to the **Deployments** tab and **redeploy** your project to apply the changes.

This is the secure, professional way to manage API keys. Your application will now work correctly both locally and on Vercel.

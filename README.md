<div align="center">
<h1 style="font-size: 3em; font-weight: bold; color: #818cf8;">🚀 Career JAM by MehtaVerse 🚀</h1>
<p><strong>Your All-in-One, Privacy-First, AI-Powered Job Search Dashboard</strong></p>
<p>
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Version-v0.1.0%2520(beta)-blueviolet%3Fstyle%3Dfor-the-badge" alt="Version">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/License-MIT-green%3Fstyle%3Dfor-the-badge" alt="License">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/AI-100%2525%2520Local-yellow%3Fstyle%3Dfor-the-badge" alt="Local AI">
</p>
</div>

Note: This is your personal job search command center. All data is stored locally on your machine, and all AI analysis is handled by a model you control. Total privacy, total power.

🚀 Quick Start: How to Use the App

Getting started with Career JAM is as simple as opening a file.

Download the Code:
Ensure you have the index.html file and any associated folders from the project source.

Open in Browser:
Simply double-click the index.html file. It will open directly in your preferred web browser (like Chrome, Firefox, or Edge).

That's it!
The application is now running locally. You can begin adding jobs, creating profiles, and tracking your progress.

🧠 Setting Up Your Local AI (LM Studio)

Unlock powerful features like resume-to-job-description matching and keyword analysis by connecting a local Large Language Model (LLM). This guide uses LM Studio, a free and user-friendly tool.

Step 1: Install LM Studio

Navigate to the official website: lmstudio.ai

Download and install the correct version for your operating system (Windows, Mac, or Linux).

Step 2: Download a Recommended Model

You need a model that is efficient for analysis but light enough for most consumer hardware.

Open LM Studio.

On the home screen's search bar, type:

gemma-2b-it-q4_0.gguf


From the search results, locate the model and click the Download button.

Tip: This model is around ~2.5GB and offers an excellent balance of performance and resource usage for this application's needs.

Step 3: Start the Local Server

This is the most critical step. The server exposes the model to the Career JAM application.

Click on the Local Server tab on the left (icon looks like <->).

In the Select a model to load dropdown, choose the gemma-2b-it model you just downloaded.

Click the green Start Server button.

⚠️ Server Configuration: Dos and Don'ts

✅ DO: Keep the LM Studio server running in the background when you want to use AI features in Career JAM.

✅ DO: Copy the full server endpoint URL. It is typically:

http://localhost:1234/v1/chat/completions


❌ DON'T: Change the server port or other advanced settings unless you are confident. The default settings are designed to work perfectly with this app.

❌ DON'T: Close LM Studio or stop the server while an AI analysis is in progress, as it will fail.

Step 4: Configure Career JAM

Return to the Career JAM application in your browser.

Navigate to the Settings page (<i class="fas fa-cog" style="color: #818cf8;"></i>).

Paste the server URL you copied from LM Studio into the "LLM Configuration" input field.

Click Test. You should see a success message. If not, please double-check that your server is active in LM Studio.

🎉 Congratulations! You are now ready to leverage all the AI-powered features of your new job tracker.

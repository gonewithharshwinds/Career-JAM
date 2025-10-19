<div align="center">
<h1 style="font-size: 3em; font-weight: bold; color: #818cf8;">🚀 Career JAM by MehtaVerse 🚀</h1>
<p align="center">
<strong>Your All-in-One, Privacy-First, AI-Powered Job Search Dashboard</strong>
</p>
<p align="center">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Version-v0.1.0_(beta)-blueviolet%3Fstyle%3Dfor-the-badge" alt="Version">
<a href="https://github.com/kefranabg/readme-md-generator/blob/master/LICENSE">
<img alt="License: MIT" src="https://www.google.com/search?q=https://img.shields.io/badge/license-MIT-green.svg%3Fstyle%3Dfor-the-badge" target="_blank" />
</a>
<img src="https://www.google.com/search?q=https://img.shields.io/badge/AI-100%25_Local-yellow%3Fstyle%3Dfor-the-badge" alt="Local AI">
<a href="https://mehtaharsh.xyz">
<img alt="Author: Harsh Mehta" src="https://www.google.com/search?q=https://img.shields.io/badge/Author-Harsh_Mehta-indigo.svg%3Fstyle%3Dfor-the-badge" target="_blank" />
</a>
</p>
</div>

A powerful, local-first application to manage your entire job search pipeline. All data and AI analysis stays on your machine, ensuring total privacy and control.

## ✨ Features

🔒 Local-First & Private: Your data never leaves your computer.

🧠 AI-Powered Analysis: Get resume-to-job matching scores and keyword analysis.

📚 Comprehensive Tracking: Manage jobs, personal profiles, companies, and contacts.

💾 Database Management: Easily backup and restore your entire database.

🔌 Customizable LLM Endpoint: Works with any OpenAI-compatible local server, like LM Studio.

### 🚀 Getting Started

Getting started with Career JAM is as simple as opening a file.

#### Download the Code:
Ensure you have the index.html file from the project source.

#### Open in Browser:
Simply double-click the index.html file. It will open directly in your preferred web browser (like Chrome, Firefox, or Edge).

**That's it!**
The application is now running locally. You can begin adding jobs, creating profiles, and tracking your progress.

### 🧠 Local AI Setup (LM Studio)

Unlock powerful features by connecting a local Large Language Model (LLM). This guide uses LM Studio, a free and user-friendly tool.

#### Step 1: Install LM Studio

Navigate to the official website: 
```
https:://lmstudio.ai
```
Download and install the correct version for your operating system.

#### Step 2: Download a Recommended Model

You need a model that is efficient for analysis but light enough for most consumer hardware.

Open LM Studio.

On the home screen's search bar, type:
```
gemma-2b-it-q4_0.gguf
```

From the search results, locate the model and click the Download button.

Tip: This model is around ~2.5GB and offers an excellent balance of performance and resource usage for this application's needs.

Step 3: Start the Local Server

This is the most critical step. The server exposes the model to the Career JAM application.

Click on the Local Server tab on the left (icon looks like <->).

In the Select a model to load dropdown, choose the gemma-2b-it model you just downloaded.

Click the green Start Server button.

⚠️ Server Configuration: Dos and Don'ts

✅ DO: Keep the LM Studio server running in the background when you want to use AI features.

✅ DO: Copy the full server endpoint URL. It is typically:

http://localhost:1234/v1/chat/completions


❌ DON'T: Change the server port or other advanced settings. The default settings work perfectly.

❌ DON'T: Close LM Studio or stop the server while an AI analysis is in progress, as it will fail.

Step 4: Configure Career JAM

Return to the Career JAM application in your browser.

Navigate to the Settings page (<i class="fas fa-cog" style="color: #818cf8;"></i>).

Paste the server URL into the "LLM Configuration" input field.

Click Test. A success message should appear. If not, double-check that your server is active in LM Studio.

🎉 Congratulations! You are now ready to leverage all the AI-powered features of your new job tracker.

🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

👤 Author

Harsh Mehta

Website: https://mehtaharsh.xyz

GitHub: @gonewithaharshwinds

Show your support

Please ⭐️ this repository if this project helped you!

📝 License

This project is MIT licensed.

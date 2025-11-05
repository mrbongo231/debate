# Eloquent Engine

Welcome to Eloquent Engine, a powerful public speaking aid designed to help you craft compelling speeches, from impromptu outlines to championship-level orations for Extemporaneous Speaking and Congressional Debate.

## Running in GitHub Codespaces

This project is optimized for development and use within GitHub Codespaces, providing a seamless, one-click setup experience.

### 1. Launching the Codespace

Navigate to your repository on GitHub.com and click the **"Code"** button. Under the **"Codespaces"** tab, click **"Create codespace on main"**. This will set up a complete development environment in your browser, with all dependencies pre-installed.

### 2. Starting the Application

The application is configured to start automatically when the Codespace launches. Once the setup is complete, you will see a simple "Hello, world!" page. This confirms that the Next.js server is running correctly.

The development server runs on port 9002.

### 3. Accessing the Application

GitHub Codespaces will automatically forward the necessary port. A notification will appear at the bottom-right of your screen prompting you to **"Open in Browser"**. Click this to open your running application in a new tab.

That's it! The application is fully functional, and you can start generating speeches immediately.

**Note on API Keys:** The `GEMINI_API_KEY` is managed via repository secrets in this Codespace, so you do not need to set up any `.env` files or provide your own key.

## Local Development Setup

If you prefer to run the project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/mrbongo231/debate.git
cd debate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env` in the root of your project directory and add your Gemini API key.

```
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

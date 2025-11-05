# Eloquent Engine: AI-Powered Public Speaking Coach

Eloquent Engine is a Next.js web application designed to help public speakers, debaters, and students master the art of persuasion. It leverages generative AI to provide structured speech outlines, full-length speech drafts for various debate formats, and practice tools to help you refine your delivery.

This application is built with Next.js, Tailwind CSS, ShadCN UI components, and Genkit for its AI capabilities.

## Running in GitHub Codespaces

GitHub Codespaces provides a complete, cloud-based development environment directly in your browser. Follow these steps to set up and run Eloquent Engine.

### 1. Launching the Codespace

1.  Navigate to the main page of your GitHub repository.
2.  Click the **`< > Code`** button.
3.  Go to the **"Codespaces"** tab.
4.  Click **"Create codespace on main"**.

GitHub will automatically set up the environment, including all necessary API keys. This may take a few minutes.

### 2. Installing Dependencies

Once the Codespace is loaded, a terminal should automatically open. The project is configured to install all necessary dependencies automatically upon creation.

If for any reason it does not, you can run the installation manually by typing the following command into the terminal:

```bash
npm install
```

### 3. Running the Application

Now you are ready to start the development server. Run the following command in the terminal:

```bash
npm run dev
```

The application will start, and Codespaces will prompt you to **open the running application in a new browser tab**. Click the button to view your live application. Any changes you make to the code will now automatically reload in the browser.

### Using the Application

*   **Impromptu Outline:** Navigate to `/impromptu` to generate quick, structured speech outlines from a topic or quote.
*   **Extemp AI:** Go to `/extemp` to craft a full-length extemporaneous speech with creative hooks and sourced evidence.
*   **Congress AI:** Visit `/congress` to generate complete affirmative or negative speeches for Congressional Debate based on legislation text.
*   **Practice Tools:** Use the built-in timer and speech history on each page to refine your delivery and track your progress.

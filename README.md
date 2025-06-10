# Paw Patrol Story Generator

This project contains two versions of a React-based application that uses the OpenAI API to generate stories for children based on the Paw Patrol universe.

## How to Run

1.  Make sure you have Node.js and npm installed.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`
4.  You will be prompted to enter your OpenAI API key in the application UI.

## Versions

The `src` directory contains two main application components, representing two different approaches to story generation.

### Version 1: `App.jsx` (Classic Story Generator)

This was the initial version of the application.

**Features:**
*   **Full Story Generation:** Select a theme and generate a complete story from beginning to end.
*   **AI-Powered Themes:** Generate new, creative story themes on the fly.
*   **Interactive Editing:** Regenerate individual parts of the story (intro, quests, outro) with specific prompts like "make it funnier."
*   **Illustration:** Generate a DALL-E 3 image for each section of the story.
*   **Dark Mode:** A simple UI toggle for a dark theme.

To use this version, you would typically change the `import` in `main.jsx` to use `App` from `./App.jsx`.

### Version 2: `Interactive-Story.jsx` (Interactive Story Builder)

This is the current and more advanced version of the application, designed as a step-by-step, collaborative story-building experience.

**Features:**
*   **Guided, Step-by-Step Flow:** The user is guided through a series of choices to build the story piece by piece.
*   **Interactive Choices:** At each step of the story, the AI presents three possible plot directions, and the user's choice determines what happens next.
*   **User-Controlled Pacing:** The user decides when the story is long enough and can choose to end it with or without a final plot twist.
*   **Multi-Language Support:** The entire UI and all AI-generated content can be switched between English, German, and Slovak on the fly.
*   **State Persistence:** The API key is saved in `localStorage` for convenience.

This version is currently the default export in the project. 
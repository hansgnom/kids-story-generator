import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const pupOptions = ["Chase", "Skye", "Marshall", "Rubble", "Rocky", "Zuma", "Everest", "Tracker", "Rex", "Liberty"];
const subQuests = [
  "Helping a lost animal",
  "Fixing a broken bridge",
  "Solving a puzzle",
  "Finding hidden clues",
  "Calming a scared critter"
];
const languages = ["English", "German", "Slovak"];

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [colorTheme, setColorTheme] = useState("light");
  const [theme, setTheme] = useState("");
  const [generatedThemes, setGeneratedThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [selectedPups, setSelectedPups] = useState([]);
  const [useSubquests, setUseSubquests] = useState(false);
  const [selectedSubquests, setSelectedSubquests] = useState([]);
  const [language, setLanguage] = useState("English");
  const [storyParts, setStoryParts] = useState({
    intro: { title: "Intro", content: "" },
    quests: [],
    outro: { title: "Outro", content: "" }
  });
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toggleTheme = () => {
    setColorTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const togglePup = (pup) => {
    setSelectedPups((prev) => (prev.includes(pup) ? prev.filter((p) => p !== pup) : [...prev, pup]));
  };

  const toggleSubquest = (quest) => {
    setSelectedSubquests((prev) => (prev.includes(quest) ? prev.filter((q) => q !== quest) : [...prev, quest]));
  };

  const handleGenerateThemes = async () => {
    if (!apiKey) {
      alert("Please enter your OpenAI API key first.");
      return;
    }
    setThemesLoading(true);
    const themePrompt = `
You are a creative assistant for children's stories. I need you to generate 5 fun and adventurous story themes for a Paw Patrol episode, suitable for children aged 4-8.

For each theme, provide a short, catchy title and a one-sentence description that hints at a light-hearted mission emphasizing teamwork and problem-solving. The themes should be set in exciting locations all over adventure bay and around. Please add a relevant emoji to each title.

Output a single JSON object with a "themes" key, which is an array of objects. Each object should have "title" and "description" keys.

Example format:
{
  "themes": [
    { "title": "🚀 The Great Space Chase", "description": "The pups blast off to find the missing Golden Comet before it disappears forever." },
    { "title": "🦖 Dinosaur Egg Rescue", "description": "A baby T-Rex has lost its egg, and the Paw Patrol must travel back in time to help find it." }
  ]
}
`;
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: themePrompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(errorData.error.message || "Failed to fetch themes from OpenAI.");
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      setGeneratedThemes(content.themes || []);
      setTheme(""); // Reset selected theme
    } catch (error) {
      console.error("Error generating themes:", error);
      alert(`Error generating themes: ${error.message}`);
    } finally {
      setThemesLoading(false);
    }
  };

  const handleRegeneratePart = async (partType, index, modificationRequest) => {
    if (!apiKey) {
      alert("Please enter your OpenAI API key.");
      return;
    }
    setIsRegenerating(true);

    let originalContent = "";
    let originalTitle = "";
    if (partType === "intro") {
      originalContent = storyParts.intro.content;
      originalTitle = storyParts.intro.title;
    } else if (partType === "outro") {
      originalContent = storyParts.outro.content;
      originalTitle = storyParts.outro.title;
    } else if (partType === "quest") {
      originalContent = storyParts.quests[index].content;
      originalTitle = storyParts.quests[index].title;
    }

    const regenerationPrompt = `
You are a story editor. Your task is to revise a part of a Paw Patrol story based on a specific request and give it a new, creative title.

**Original Story Context:**
*   Theme/Location: ${theme}
*   Pups on the Mission: ${selectedPups.join(", ")}
*   Full Story So Far (for context):
    *   Intro: ${storyParts.intro.content}
    *   Quests: ${storyParts.quests.map((q) => q.content).join("\n\n")}
    *   Outro: ${storyParts.outro.content}

**Part to Revise:**
*   Original Title: "${originalTitle}"
*   Original Content:
    \`\`\`
    ${originalContent}
    \`\`\`

**User's Request:**
"${modificationRequest}"

**Your Task:**
1.  Rewrite ONLY the content based on the user's request. Maintain the cheerful, imaginative, and age-appropriate tone.
2.  Create a new, short, and creative title for the revised part that reflects its NEW content.

**Output Format:**
Output a single JSON object with "title" and "content" keys. The content should be the revised paragraph as a single raw string.
Example: { "title": "A Funny Tumble", "content": "The revised paragraph about a pup tumbling hilariously..." }
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [{ role: "user", content: regenerationPrompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Failed to fetch from OpenAI.");
      }

      const data = await response.json();
      const regeneratedPart = JSON.parse(data.choices[0].message.content);

      setStoryParts((currentParts) => {
        const newParts = { ...currentParts };
        if (partType === "intro") {
          newParts.intro = regeneratedPart;
        } else if (partType === "outro") {
          newParts.outro = regeneratedPart;
        } else if (partType === "quest") {
          const newQuests = [...currentParts.quests];
          newQuests[index] = regeneratedPart;
          newParts.quests = newQuests;
        }
        return newParts;
      });
    } catch (error) {
      console.error("Error regenerating part:", error);
      alert(`Error regenerating part: ${error.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!apiKey) {
      alert("Please enter your OpenAI API key.");
      return;
    }

    setLoading(true);

    const prompt = `
You are a creative children's storyteller. Your task is to write a fun, adventurous, and age-appropriate Paw Patrol bedtime story for children aged 4 to 8. Please use a lot of emojis! 🥳

**Story Guidelines:**

1.  **Tone:** Cheerful, imaginative, and engaging. Create a gentle sense of suspense, but lead to a calm, cozy ending perfect for bedtime.
2.  **Narrative Style:** Write in a rich, flowing narrative with descriptive text, not just dialogue. Make it feel natural and exciting to read aloud.
3.  **Characters & Mission:**
    *   **Ryder is the Leader:** The story must begin with Ryder explaining the mission and selecting the right pups for the job based on their skills. The pups do not introduce themselves.
    *   **Correct Pup Abilities:** Ensure each pup uses their correct, well-known special abilities and tools. No mix-ups!
    *   **Teamwork:** The mission should be light-hearted and emphasize teamwork, bravery, and problem-solving.
4.  **Structure:** The story must be divided into three parts: an intro, quests, and an outro.

**Inputs for this specific story:**

*   **Theme/Location:** ${theme}
*   **Pups on the Mission:** ${selectedPups.join(", ")}
*   **Subquests (if any):** ${useSubquests ? selectedSubquests.join(", ") : "None. Create a main mission based on the theme."}
*   **Language:** ${language}

**Output Format:**

Please provide the output as a single JSON object with three keys: "intro", "quests", and "outro".
*   "intro": A paragraph where Ryder introduces the mission and calls the selected pups.
*   "quests": An array of strings. Each string is a paragraph describing a part of the mission. If there are subquests, each quest should correspond to one subquest. If not, break the main mission into logical steps.
*   "outro": A paragraph that provides a calm, cozy resolution to the story, wrapping up the adventure nicely for bedtime.
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", errorData);
        throw new Error(errorData.error.message || "Failed to fetch story from OpenAI.");
      }

      const data = await response.json();
      const storyContent = JSON.parse(data.choices[0].message.content);

      setStoryParts({
        intro: { title: "Intro", content: storyContent.intro || "" },
        quests: Array.isArray(storyContent.quests)
          ? storyContent.quests.map((quest, index) => ({
              title: `Quest ${index + 1}`,
              content: quest
            }))
          : [],
        outro: { title: "Outro", content: storyContent.outro || "" }
      });
    } catch (error) {
      console.error("Error generating story:", error);
      alert(`Error generating story: ${error.message}`);
      setStoryParts({
        intro: { title: "Intro", content: "" },
        quests: [],
        outro: { title: "Outro", content: "" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <div
        className={`w-72 p-4 space-y-6 ${
          colorTheme === "dark" ? "bg-gray-800 text-gray-200" : "bg-gray-100"
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Story Settings</h2>
          <button
            onClick={toggleTheme}
            className={`p-1 rounded-full ${
              colorTheme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-300"
            }`}
          >
            {colorTheme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <div>
          <p className="font-semibold mb-1">OpenAI API Key</p>
          <input
            type="password"
            className={`w-full px-2 py-1 border rounded ${
              colorTheme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white"
            }`}
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div>
          <p className="font-semibold mb-1">Theme</p>
          <button
            className={`w-full py-1 rounded mb-2 ${
              colorTheme === "dark"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={handleGenerateThemes}
            disabled={themesLoading || !apiKey || isRegenerating}
          >
            {themesLoading ? "Generating..." : "✨ Generate New Themes"}
          </button>
          {generatedThemes.map((t) => (
            <button
              key={t.title}
              className={`block w-full text-left px-2 py-2 rounded mb-1 ${
                theme === t.title
                  ? colorTheme === "dark"
                    ? "bg-blue-700"
                    : "bg-blue-300"
                  : colorTheme === "dark"
                  ? "hover:bg-blue-900"
                  : "hover:bg-blue-100"
              }`}
              onClick={() => setTheme(t.title)}
            >
              <p className="font-bold">{t.title}</p>
              <p
                className={`text-sm ${
                  colorTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t.description}
              </p>
            </button>
          ))}
        </div>

        <div>
          <p className="font-semibold mb-1">Pups</p>
          <div className="flex flex-wrap gap-1">
            {pupOptions.map((pup) => (
              <button
                key={pup}
                className={`px-2 py-1 rounded text-sm ${
                  selectedPups.includes(pup)
                    ? "bg-blue-400 text-white"
                    : colorTheme === "dark"
                    ? "bg-gray-600 border-gray-500"
                    : "bg-white border"
                }`}
                onClick={() => togglePup(pup)}
              >
                {pup}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold mb-1">Subquests</p>
          <div className="flex gap-2 mb-2">
            <button
              className={`px-2 py-1 rounded ${
                useSubquests
                  ? "bg-blue-400 text-white"
                  : colorTheme === "dark"
                  ? "bg-gray-600 border-gray-500"
                  : "bg-white border"
              }`}
              onClick={() => setUseSubquests(true)}
            >
              Yes
            </button>
            <button
              className={`px-2 py-1 rounded ${
                !useSubquests
                  ? "bg-blue-400 text-white"
                  : colorTheme === "dark"
                  ? "bg-gray-600 border-gray-500"
                  : "bg-white border"
              }`}
              onClick={() => setUseSubquests(false)}
            >
              No
            </button>
          </div>
          {useSubquests && (
            <div className="flex flex-wrap gap-1">
              {subQuests.map((q) => (
                <button
                  key={q}
                  className={`px-2 py-1 rounded text-sm ${
                    selectedSubquests.includes(q)
                      ? "bg-blue-400 text-white"
                      : colorTheme === "dark"
                      ? "bg-gray-600 border-gray-500"
                      : "bg-white border"
                  }`}
                  onClick={() => toggleSubquest(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold mb-1">Language</p>
          {languages.map((lang) => (
            <button
              key={lang}
              className={`block w-full text-left px-2 py-1 rounded mb-1 ${
                language === lang
                  ? colorTheme === "dark"
                    ? "bg-blue-700"
                    : "bg-blue-300"
                  : colorTheme === "dark"
                  ? "hover:bg-blue-900"
                  : "hover:bg-blue-100"
              }`}
              onClick={() => setLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          className={`w-full bg-blue-600 text-white py-2 rounded mt-4 ${
            colorTheme === "dark" ? "hover:bg-blue-800" : "hover:bg-blue-700"
          }`}
          onClick={handleGenerateStory}
          disabled={loading || !theme || selectedPups.length === 0 || !apiKey || isRegenerating}
        >
          {loading ? "Generating..." : "Generate Story"}
        </button>
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 space-y-4 ${
          colorTheme === "dark" ? "bg-gray-900 text-gray-200" : "bg-white"
        }`}
      >
        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            colorTheme === "dark" ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Paw Patrol Adventure Story
        </h1>

        <AccordionSection
          title={storyParts.intro.title}
          content={storyParts.intro.content}
          onRegenerate={(request) => handleRegeneratePart("intro", null, request)}
          colorTheme={colorTheme}
        />

        {Array.isArray(storyParts.quests) &&
          storyParts.quests.map((quest, index) => (
            <AccordionSection
              key={index}
              title={quest.title}
              content={quest.content}
              onRegenerate={(request) => handleRegeneratePart("quest", index, request)}
              colorTheme={colorTheme}
            />
          ))}

        <AccordionSection
          title={storyParts.outro.title}
          content={storyParts.outro.content}
          onRegenerate={(request) => handleRegeneratePart("outro", null, request)}
          colorTheme={colorTheme}
        />
      </main>
    </div>
  );
}

const regenerationProposals = [
  "Make it much longer",
  "Add something funny",
  "Add dialogues",
  "More emotional",
  "More emojis ✨"
];

function AccordionSection({ title, content, onRegenerate, colorTheme }) {
  const [isOpen, setIsOpen] = useState(true);
  const [modificationRequest, setModificationRequest] = useState("");
  const [selectedProposals, setSelectedProposals] = useState([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toggleProposal = (proposal) => {
    setSelectedProposals((prev) =>
      prev.includes(proposal) ? prev.filter((p) => p !== proposal) : [...prev, proposal]
    );
  };

  const handleRegenerateClick = async () => {
    const fullRequest = [...selectedProposals, modificationRequest].filter(Boolean).join(", ");
    if (!fullRequest.trim()) {
      alert("Please enter or select what you'd like to change.");
      return;
    }
    setIsRegenerating(true);
    if (onRegenerate) {
      await onRegenerate(fullRequest);
    }
    setIsRegenerating(false);
    setModificationRequest("");
    setSelectedProposals([]);
  };

  return (
    <div className={`border rounded shadow-sm ${colorTheme === "dark" ? "border-gray-700" : ""}`}>
      <button
        className={`w-full flex justify-between items-center px-4 py-2 ${
          colorTheme === "dark"
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </button>
      {isOpen && (
        <div
          className={`p-4 space-y-3 ${
            colorTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <div
            className={`whitespace-pre-line ${
              colorTheme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {content || (
              <em
                className={colorTheme === "dark" ? "text-gray-400" : "text-gray-500"}
              >
                No content yet.
              </em>
            )}
          </div>
          {content && onRegenerate && (
            <div
              className={`pt-3 border-t mt-3 space-y-3 ${
                colorTheme === "dark" ? "border-gray-600" : ""
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {regenerationProposals.map((proposal) => (
                  <button
                    key={proposal}
                    onClick={() => toggleProposal(proposal)}
                    className={`px-2 py-1 rounded text-sm ${
                      selectedProposals.includes(proposal)
                        ? "bg-purple-600 text-white"
                        : colorTheme === "dark"
                        ? "bg-gray-600 text-white hover:bg-gray-500"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {proposal}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className={`flex-grow px-2 py-1 border rounded ${
                    colorTheme === "dark" ? "bg-gray-700 border-gray-600" : ""
                  }`}
                  placeholder="...or add your own custom request here"
                  value={modificationRequest}
                  onChange={(e) => setModificationRequest(e.target.value)}
                />
                <button
                  className={`bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 ${
                    colorTheme === "dark"
                      ? "disabled:bg-gray-600"
                      : "disabled:bg-gray-400"
                  }`}
                  onClick={handleRegenerateClick}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? "..." : "Regenerate"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

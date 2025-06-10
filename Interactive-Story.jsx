import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const pupOptions = [
  { name: "Chase", emoji: "🚓" },
  { name: "Marshall", emoji: "🚒" },
  { name: "Skye", emoji: "🚁" },
  { name: "Rubble", emoji: "🚧" },
  { name: "Rocky", emoji: "♻️" },
  { name: "Zuma", emoji: "🚤" },
  { name: "Everest", emoji: "🏔️" },
  { name: "Tracker", emoji: "🌴" },
  { name: "Liberty", emoji: "🛴" },
  { name: "Rex", emoji: "🦖" }
];

const translations = {
  "English": {
    welcome: "Welcome, Storyteller!",
    enterApiKey: "Please enter your OpenAI API key to begin our adventure.",
    letsGo: "Let's Go!",
    beginAdventure: "Let's begin your Paw Patrol adventure! 🐶✨",
    chooseTheme: "Choose a theme for the story setting:",
    showDifferentThemes: "Show me different themes!",
    whichPups: "Which pups will join this mission? 🐾",
    chooseUpTo3: "You can choose up to 3. Here are your options:",
    teamChosen: "Team Chosen! Let's Go!",
    adventureBegins: "The Adventure Begins!",
    readyToRoll: "Are you ready to roll out? 🐾",
    letsRoll: "Let's roll!",
    pupsGottaFly: "This pup's gotta fly!",
    ruffRuffRescue: "Ready for a ruff-ruff rescue!",
    greenMeansGo: "Green means go!",
    adventureUnfolds: "The Adventure Unfolds...",
    whatHappensNext: "What happens next?",
    storyLongEnough: "I think the story is long enough, let's wrap it up!",
    wrapItUp: "Time to wrap it up?",
    finalTwist: "Or would you like one final twist?!",
    endItHere: "Let's end it here.",
    addFinalTwist: "Add a final twist!",
    adventureEnds: "And so the adventure ends... 🌙",
    createANewStory: "Create a new story!",
    thinking: "Thinking of something pawsome...",
    confirmLanguageSwitch: "Are you sure you want to switch the language to"
  },
  "German": {
    welcome: "Willkommen, Geschichtenerzähler!",
    enterApiKey: "Bitte gib deinen OpenAI API-Schlüssel ein, um unser Abenteuer zu beginnen.",
    letsGo: "Los geht's!",
    beginAdventure: "Beginnen wir dein Paw Patrol Abenteuer! 🐶✨",
    chooseTheme: "Wähle ein Thema für die Geschichte:",
    showDifferentThemes: "Zeig mir andere Themen!",
    whichPups: "Welche Welpen sollen an dieser Mission teilnehmen? 🐾",
    chooseUpTo3: "Du kannst bis zu 3 auswählen. Hier sind deine Optionen:",
    teamChosen: "Team ausgewählt! Los geht's!",
    adventureBegins: "Das Abenteuer beginnt!",
    readyToRoll: "Bist du bereit, loszulegen? 🐾",
    letsRoll: "Auf die Plätze, fertig, los!",
    pupsGottaFly: "Dieser Welpe muss fliegen!",
    ruffRuffRescue: "Bereit für eine Ruff-Ruff-Rettung!",
    greenMeansGo: "Grün heißt Go!",
    adventureUnfolds: "Das Abenteuer entfaltet sich...",
    whatHappensNext: "Was passiert als Nächstes?",
    storyLongEnough: "Ich glaube, die Geschichte ist lang genug, lass uns zum Ende kommen!",
    wrapItUp: "Zeit, es abzuschließen?",
    finalTwist: "Oder möchtest du eine letzte Wendung?!",
    endItHere: "Lass es uns hier beenden.",
    addFinalTwist: "Füge eine letzte Wendung hinzu!",
    adventureEnds: "Und so endet das Abenteuer... 🌙",
    createANewStory: "Eine neue Geschichte erstellen!",
    thinking: "Denke mir etwas Pfoten-tastisches aus...",
    confirmLanguageSwitch: "Bist du sicher, dass du die Sprache auf"
  },
  "Slovak": {
    welcome: "Vitaj, rozprávač!",
    enterApiKey: "Prosím, zadaj svoj OpenAI API kľúč, aby sme mohli začať naše dobrodružstvo.",
    letsGo: "Poďme na to!",
    beginAdventure: "Začnime tvoje dobrodružstvo s Labkovou patrolou! 🐶✨",
    chooseTheme: "Vyber si tému pre prostredie príbehu:",
    showDifferentThemes: "Ukáž mi iné témy!",
    whichPups: "Ktoré šteniatka sa zúčastnia tejto misie? 🐾",
    chooseUpTo3: "Môžeš si vybrať až 3. Tu sú tvoje možnosti:",
    teamChosen: "Tím je vybraný! Poďme na to!",
    adventureBegins: "Dobrodružstvo sa začína!",
    readyToRoll: "Si pripravený vyraziť? 🐾",
    letsRoll: "Poďme na to!",
    pupsGottaFly: "Toto šteniatko musí letieť!",
    ruffRuffRescue: "Pripravený na chlpáčsku záchranu!",
    greenMeansGo: "Zelená znamená štart!",
    adventureUnfolds: "Dobrodružstvo sa odvíja...",
    whatHappensNext: "Čo sa stane ďalej?",
    storyLongEnough: "Myslím, že príbeh je dosť dlhý, poďme to ukončiť!",
    wrapItUp: "Je čas to ukončiť?",
    finalTwist: "Alebo by si chcel ešte jeden záverečný zvrat?!",
    endItHere: "Ukončime to tu.",
    addFinalTwist: "Pridaj posledný zvrat!",
    adventureEnds: "A tak sa dobrodružstvo končí... 🌙",
    createANewStory: "Vytvoriť nový príbeh!",
    thinking: "Vymýšľam niečo labko-tastické...",
    confirmLanguageSwitch: "Si si istý, že chceš prepnúť jazyk na"
  }
};

const LoadingSpinner = ({ language }) => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-lg">{translations[language].thinking}</p>
  </div>
);

const callOpenAI = async (apiKey, prompt, model = "gpt-4-turbo-preview") => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Failed to fetch from OpenAI.");
      }
      const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

function ApiKeyScreen({ onApiKeySubmit, language }) {
  const [key, setKey] = useState("");
  const t = translations[language];
  return (
    <div className="text-center max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">{t.welcome}</h1>
      <p className="mb-6">{t.enterApiKey}</p>
      <input
        type="password"
        className="w-full px-3 py-2 border rounded shadow-sm mb-4"
        placeholder="Enter your API key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-400"
        onClick={() => onApiKeySubmit(key)}
        disabled={!key}
      >
        {t.letsGo}
      </button>
    </div>
  );
}

function ThemeSelectionScreen({ apiKey, setSelectedTheme, setStep, language }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  const generateThemes = async () => {
    setLoading(true);
    try {
      const themePrompt = `You are a creative assistant. Generate 9 exciting and child-friendly story themes for a Paw Patrol adventure set in or around Adventure Bay. For each theme, provide a short, catchy title with a relevant emoji, and a one-sentence description of the main story. Output a single JSON object with a "themes" key, which is an array of objects. Each object should have "title" and "description" keys. The response should be in ${language}.`;
      const data = await callOpenAI(apiKey, themePrompt);
      setThemes(data.themes || []);
    } catch (error) {
      alert(`Error generating themes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateThemes();
  }, [language]);

  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t.beginAdventure}</h1>
      <p className="text-lg mb-6">{t.chooseTheme}</p>
      {loading ? (
        <LoadingSpinner language={language} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.title}
                className="p-4 border rounded-lg shadow-sm hover:bg-blue-100 hover:shadow-lg transition text-left"
                onClick={() => {
                  setSelectedTheme(theme);
                  setStep("PUP_SELECTION");
                }}
              >
                <h2 className="font-bold text-lg mb-1">{theme.title}</h2>
                <p className="text-sm text-gray-600">{theme.description}</p>
              </button>
            ))}
          </div>
          <button
            onClick={generateThemes}
            className="mt-6 bg-gray-200 px-6 py-2 rounded-full hover:bg-gray-300"
          >
            {t.showDifferentThemes}
          </button>
        </>
      )}
        </div>
  );
}

function PupSelectionScreen({ setSelectedPups, setStep, language }) {
  const [localSelectedPups, setLocalSelectedPups] = useState([]);
  const t = translations[language];

  const togglePup = (pupName) => {
    setLocalSelectedPups((prev) => {
      if (prev.includes(pupName)) {
        return prev.filter((p) => p !== pupName);
      }
      if (prev.length < 3) {
        return [...prev, pupName];
      }
      return prev; // Max 3 pups
    });
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t.whichPups}</h1>
      <p className="text-lg mb-6">{t.chooseUpTo3}</p>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {pupOptions.map((pup) => (
          <button
            key={pup.name}
            onClick={() => togglePup(pup.name)}
            className={`px-4 py-2 rounded-full text-lg border-2 transition ${
              localSelectedPups.includes(pup.name)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white hover:bg-blue-100"
            }`}
          >
            {`${pup.name} ${pup.emoji}`}
            </button>
          ))}
        </div>
              <button
        className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400 text-xl"
        onClick={() => {
          setSelectedPups(localSelectedPups);
          setStep("INTRO_GENERATION");
        }}
        disabled={localSelectedPups.length === 0}
      >
        {t.teamChosen}
      </button>
    </div>
  );
}

function IntroScreen({ apiKey, theme, pups, story, setStory, setStep, language }) {
  useEffect(() => {
    const generateIntro = async () => {
      const prompt = `You are a creative children's storyteller. Write the intro for a Paw Patrol story in ${language}.
      **Theme:** ${theme.title} - ${theme.description}
      **Pups on the mission:** ${pups.join(", ")}
      **Instructions:**
      1. Start with a hook to start the mission.
      2. Ryder summons all the pups to the Lookout and explains the mission in detail.
      3. One-by-one, Ryder announces which pups are part of the mission and why their specific skills are perfect for this adventure. The chosen pups should react in their unique, enthusiastic styles.
      4. Write multiple paragraphs of exciting setup.
      **Output:** A single JSON object with an "intro" key containing the story text.`;
      try {
        const data = await callOpenAI(apiKey, prompt);
        setStory({ ...story, intro: data.intro });
        setStep("STORY_WRITING");
      } catch (e) {
        alert(e.message);
        // Optionally, handle error by going back or allowing a retry
      }
    };
    generateIntro();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <LoadingSpinner language={language} />
    </div>
  );
}

function StoryWritingScreen({ apiKey, theme, pups, story, setStory, setStep, language }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingNextBeat, setLoadingNextBeat] = useState(false);
    const t = translations[language];

    const getStoryContext = () => story.intro + '\n\n' + story.beats.map((b) => b.content).join('\n\n');

    const generateOptions = async () => {
        setLoading(true);
        const prompt = `Based on the story so far, provide 3 exciting and logical next-move options for the Paw Patrol. Keep them short and action-oriented. The response should be in ${language}.
        **Story so far:**\n${getStoryContext()}
        **Output:** A JSON object with an "options" key, which is an array of 3 strings.`;
        try {
            const data = await callOpenAI(apiKey, prompt);
            setOptions(data.options || []);
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const generateNextBeat = async (choice) => {
        setLoadingNextBeat(true);
        const prompt = `The user chose: "${choice}". Write the next part of the story in ${language} in rich, multi-paragraph detail. Ryder should be actively leading the pups, who use their unique skills to handle the situation. Include fun dialogue and action.
        **Story so far:**\n${getStoryContext()}
        **Output:** A JSON object with two keys: "title" (a short, creative title for this new part of the story) and "content" (the new story text).`;
        try {
            const data = await callOpenAI(apiKey, prompt);
            setStory(prev => ({ ...prev, beats: [...prev.beats, data] }));
        } catch (e) {
            alert(e.message);
        } finally {
            setLoadingNextBeat(false);
        }
    };

    useEffect(() => {
        if (story.beats.length === 0) {
            generateOptions();
        } else {
            // After a new beat is added, generate the next set of options
            generateOptions();
        }
    }, [story.beats.length, language]);

    const handleOptionClick = async (option) => {
        setOptions([]);
        await generateNextBeat(option);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-1 text-center">{theme.title}</h1>
                <p className="text-lg text-gray-600 mb-6 text-center">{theme.description}</p>

                <div className="whitespace-pre-line text-gray-700 leading-relaxed mb-6">
                    <h2 className="text-xl font-bold mb-2 border-b pb-2">Part 1: The Mission Begins</h2>
                    <p>{story.intro}</p>
                    {story.beats.map((beat, i) => (
                        <div key={i} className="mt-6">
                            <h2 className="text-xl font-bold mb-2 border-b pb-2">{`Part ${i + 2}: ${beat.title}`}</h2>
                            <p>{beat.content}</p>
                        </div>
                    ))}
                </div>

                {loadingNextBeat && <LoadingSpinner language={language} />}
                
                {!loadingNextBeat && (
                    <div className="text-center mt-8">
                        {loading ? <LoadingSpinner language={language} /> : (
                            <>
                                <h2 className="text-2xl font-bold mb-4">{t.whatHappensNext}</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {options.map((option, i) => (
            <button
                                            key={i}
                                            onClick={() => handleOptionClick(option)}
                                            className="w-full bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600"
                                        >
                                            {option}
            </button>
                                    ))}
            <button
                                        onClick={() => setStep("OUTRO")}
                                        className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 mt-4"
                                    >
                                        {t.storyLongEnough}
            </button>
          </div>
                            </>
                        )}
            </div>
          )}
        </div>
        </div>
    );
}

function OutroScreen({ apiKey, theme, pups, story, onRestart, language }) {
    const [loading, setLoading] = useState(false);
    const [outro, setOutro] = useState(null);
    const t = translations[language];

    const getStoryContext = () => {
        const beatsText = story.beats.map((b) => b.content).join("\n\n");
        return story.intro + "\n\n" + beatsText;
    };

    const generateOutro = async (withTwist) => {
        setLoading(true);
        let prompt = `Write a warm, cozy conclusion in ${language} to the adventure. Show the team coming together, celebrating their success. Perfect for a bedtime wind-down.
        **Story so far:**\n${getStoryContext()}`;
        
        if (withTwist) {
            prompt = `The user wants a final twist! Write one last, fun, surprising mini-challenge or obstacle in ${language}, and then quickly resolve it before writing the warm, cozy conclusion.
            **Story so far:**\n${getStoryContext()}`;
        }
        
        prompt += `\n**Output:** A JSON object with a "title" for the outro section and "content" for the final story text.`;

        try {
            const data = await callOpenAI(apiKey, prompt);
            setOutro(data);
        } catch(e) {
            alert(e.message)
        } finally {
            setLoading(false);
        }
    }

    if (outro) {
        return (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-1 text-center">{theme.title}</h1>
                <p className="text-lg text-gray-600 mb-6 text-center">{theme.description}</p>
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    <h2 className="text-xl font-bold mb-2 border-b pb-2">Part 1: The Mission Begins</h2>
                    <p>{story.intro}</p>
                    {story.beats.map((beat, i) => (
                        <div key={i} className="mt-6">
                            <h2 className="text-xl font-bold mb-2 border-b pb-2">{`Part ${i + 2}: ${beat.title}`}</h2>
                            <p>{beat.content}</p>
                        </div>
                    ))}
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-2 border-b pb-2">{`The End: ${outro.title}`}</h2>
                        <p>{outro.content}</p>
                    </div>
                </div>
                <div className="text-center">
                    <button onClick={onRestart} className="mt-8 bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 text-xl">
                        {t.createANewStory}
        </button>
      </div>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">{t.wrapItUp}</h1>
            <p className="text-lg mb-6">{t.finalTwist}</p>
            {loading ? <LoadingSpinner language={language} /> : (
                <div className="flex justify-center gap-4">
                    <button onClick={() => generateOutro(false)} className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 text-lg">
                        {t.endItHere}
                    </button>
                    <button onClick={() => generateOutro(true)} className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 text-lg">
                        {t.addFinalTwist}
                    </button>
                </div>
            )}
    </div>
  );
}

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-sm">
      <p className="text-lg mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        <button onClick={onConfirm} className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600">Confirm</button>
        <button onClick={onCancel} className="bg-gray-300 px-6 py-2 rounded-full hover:bg-gray-400">Cancel</button>
      </div>
    </div>
  </div>
);

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => (
  <div className="absolute top-4 right-4 flex gap-2 z-10">
    <button onClick={() => onLanguageChange("English")} className={`px-3 py-1 rounded-full text-sm ${currentLanguage === 'English' ? 'bg-blue-500 text-white' : 'bg-white'}`}>🇬🇧</button>
    <button onClick={() => onLanguageChange("German")} className={`px-3 py-1 rounded-full text-sm ${currentLanguage === 'German' ? 'bg-blue-500 text-white' : 'bg-white'}`}>🇩🇪</button>
    <button onClick={() => onLanguageChange("Slovak")} className={`px-3 py-1 rounded-full text-sm ${currentLanguage === 'Slovak' ? 'bg-blue-500 text-white' : 'bg-white'}`}>🇸🇰</button>
  </div>
);

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("openai_api_key") || "");
  const [step, setStep] = useState(() => (localStorage.getItem("openai_api_key") ? "THEME_SELECTION" : "API_KEY"));
  const [theme, setTheme] = useState(null);
  const [pups, setPups] = useState([]);
  const [story, setStory] = useState({ intro: "", beats: [] });
  const [language, setLanguage] = useState("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const [languageConfirmation, setLanguageConfirmation] = useState(null);

  const handleSetApiKey = (key) => {
    localStorage.setItem("openai_api_key", key);
    setApiKey(key);
    setStory({ intro: "", beats: [] });
    setStep("THEME_SELECTION");
  };

  const handleRestart = () => {
    setTheme(null);
    setPups([]);
    setStory({ intro: "", beats: [] });
    setStep("THEME_SELECTION");
  };

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage === language || isTranslating) return;
    setLanguageConfirmation(newLanguage);
  };

  const executeLanguageChange = async () => {
    if (!languageConfirmation) return;
    const newLanguage = languageConfirmation;
    setLanguageConfirmation(null); // Hide modal
    setIsTranslating(true);
    try {
      const translateJsonObject = async (obj, keys, lang) => {
        if (!obj) return obj;
        const prompt = `You are a professional translator. Translate the string values for the following keys in the provided JSON object to ${lang}: ${keys.join(
          ", "
        )}. Crucially, you must preserve the original paragraph structure and newlines (\\n) within the string values. Return the entire JSON object with the translations, keeping the JSON structure identical.
        JSON object:
        ${JSON.stringify(obj)}
        `;
        return await callOpenAI(apiKey, prompt);
      };

      const translateString = async (text, lang) => {
        if (!text) return "";
        const prompt = `You are a professional translator. Translate the following text to ${lang}. Crucially, you must preserve the original paragraph structure and newlines (\\n) in the translated text. Return a single JSON object with one key, "translation", containing only the translated text.
          Text to translate:
          "${text}"`;
        const result = await callOpenAI(apiKey, prompt);
        return result.translation || text; // Return original text if translation fails
      };

      // Perform all translations first
      const translatedTheme = await translateJsonObject(theme, ["title", "description"], newLanguage);
      const translatedIntro = await translateString(story.intro, newLanguage);
      const translatedBeats = await Promise.all(story.beats.map((beat) => translateJsonObject(beat, ["title", "content"], newLanguage)));

      // Then, update all state at once
      setTheme(translatedTheme);
      setStory({ intro: translatedIntro, beats: translatedBeats });
      setLanguage(newLanguage);
    } catch (e) {
      alert("Something went wrong during translation: " + e.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const screens = {
    API_KEY: <ApiKeyScreen onApiKeySubmit={handleSetApiKey} language={language} />,
    THEME_SELECTION: <ThemeSelectionScreen apiKey={apiKey} setSelectedTheme={setTheme} setStep={setStep} language={language} />,
    PUP_SELECTION: <PupSelectionScreen setSelectedPups={setPups} setStep={setStep} language={language} />,
    INTRO_GENERATION: <IntroScreen apiKey={apiKey} theme={theme} pups={pups} story={story} setStory={setStory} setStep={setStep} language={language} />,
    STORY_WRITING: <StoryWritingScreen apiKey={apiKey} theme={theme} pups={pups} story={story} setStory={setStory} setStep={setStep} language={language} />,
    OUTRO: <OutroScreen apiKey={apiKey} theme={theme} pups={pups} story={story} onRestart={handleRestart} language={language}/>
  };

  return (
    <div className="bg-blue-100 min-h-screen font-sans flex items-center justify-center p-4 relative">
      <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
      {isTranslating && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
          <LoadingSpinner language={language} />
        </div>
      )}
      {languageConfirmation && (
        <ConfirmationModal
          message={`${translations[language].confirmLanguageSwitch} ${languageConfirmation}? This will translate the entire story and UI.`}
          onConfirm={executeLanguageChange}
          onCancel={() => setLanguageConfirmation(null)}
        />
      )}
      <div className="w-full">{screens[step]}</div>
    </div>
  );
}

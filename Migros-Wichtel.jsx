import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const LoadingSpinner = ({ language, translations }) => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    <p className="ml-3 text-lg text-white">{translations[language]?.thinking || "Thinking..."}</p>
  </div>
);

const callOpenAI = async (apiKey, prompt, model = "gpt-4.1") => {
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

function SetupScreen({ onSettingsSubmit, language, translations }) {
  const [apiKey, setApiKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const t = translations[language];
  const handleSubmit = () => {
    onSettingsSubmit({
      apiKey,
      supabaseUrl,
      supabaseAnonKey,
    });
  };
  return (
    <div className="text-center max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">{t.welcome}</h1>
      <p className="mb-2 text-white">{t.enterApiKey}</p>
      <input
        type="password"
        className="w-[200px] px-3 py-2 border rounded shadow-sm mb-4 text-[8px]"
        placeholder="Enter your API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <p className="mb-2 mt-4 text-white">{t.enterSupabaseUrl}</p>
      <input
        type="text"
        className="w-[200px] px-3 py-2 border rounded shadow-sm mb-4 text-[8px]"
        placeholder="Enter your Supabase URL"
        value={supabaseUrl}
        onChange={(e) => setSupabaseUrl(e.target.value)}
      />
      <p className="mb-2 text-white">{t.enterSupabaseAnonKey}</p>
      <input
        type="password"
        className="w-[200px] px-3 py-2 border rounded shadow-sm mb-4 text-[8px]"
        placeholder="Enter your Supabase Anon Key"
        value={supabaseAnonKey}
        onChange={(e) => setSupabaseAnonKey(e.target.value)}
      />
      <button
        className={
            `px-8 py-3 rounded-lg text-xl border-2 transition mt-6 ` +
            (apiKey.length === 0
              ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'bg-white text-[#ff6600] border-[#ff6600] hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] active:bg-[#ff6600] active:text-white active:border-[#ff6600]')
          }
        onClick={handleSubmit}
        disabled={!apiKey}
      >
        {t.saveSettings}
      </button>
    </div>
  );
}

function MainMenuScreen({ setStep, language, translations }) {
  const t = translations[language];
  return (
    <div className="text-center max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-white">{t.chooseOption}</h1>
      <p className="text-xs text-gray-300 mb-6 whitespace-pre-line">{t.introText}</p>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setStep("THEME_SELECTION")}
          className="bg-[#ff6600] text-white px-8 py-4 rounded-lg hover:bg-[#ff6600] text-xl"
        >
          {t.createANewStory}
        </button>
        <button
          onClick={() => setStep("SAVED_STORIES")}
          className="px-8 py-4 rounded-lg border-2 text-xl bg-white text-[#ff6600] border-[#ff6600] hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] active:bg-[#ff6600] active:text-white active:border-[#ff6600]"
        >
          {t.viewSavedStories}
        </button>
      </div>
    </div>
  );
}

function ThemeSelectionScreen({ apiKey, setSelectedTheme, setStep, language, translations, promptData }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSelectedTheme, setLocalSelectedTheme] = useState(null);
  const t = translations[language];
  const generateThemes = async () => {
    setLoading(true);
    try {
      const role = promptData.migrosWichtelStoryPrompt.role;
      const expectation = promptData.migrosWichtelStoryPrompt.expectation;
      const context = promptData.migrosWichtelStoryPrompt.context;
      const tonalityStyle = promptData.migrosWichtelStoryPrompt.tonalityStyle;
      const additionalInfo = promptData.migrosWichtelStoryPrompt.additionalInfo;
      const themePrompt = `${role}\n${expectation}\n${context}\n${tonalityStyle}\n${additionalInfo}\n${promptData.migrosWichtelStoryPrompt.themeGeneration
        .replace('{language}', language)}`;

      const data = await callOpenAI(apiKey, themePrompt);
      setThemes(data.themes || []);
    } catch (error) {
      console.error(`Error generating themes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    generateThemes();
  }, [language]);
  const handleThemeSelect = (themeOption) => {
    setLocalSelectedTheme(themeOption);
  };
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-white">{t.beginAdventure}</h1>
      <p className="text-lg mb-6 text-white">{t.chooseTheme}</p>
      {loading ? (
        <LoadingSpinner language={language} translations={translations} />
      ) : (
        <>
          {themes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.title}
                  onClick={() => handleThemeSelect(themeOption)}
                  className={`p-4 border-2 transition text-left text-white justify-center items-start shadow-sm ${
                    localSelectedTheme && localSelectedTheme.title === themeOption.title
                      ? "bg-[#142138] text-white border-[#C6D8E8]"
                      : "bg-[#333335] hover:bg-[#142138] border-[#333335]"
                  }`}
                >
                  <div className="font-bold text-xl mb-2 w-full text-center">{themeOption.title}</div>
                  <div className="text-sm w-full text-center">{themeOption.description}</div>
                </button>
              ))}
              <button
                className={
                  `px-8 py-3 rounded-lg text-xl border-2 transition mt-6 ` +
                  (!localSelectedTheme
                    ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-[#ff6600] border-[#ff6600] hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] active:bg-[#ff6600] active:text-white active:border-[#ff6600]')
                }
                onClick={() => {
                  setSelectedTheme(localSelectedTheme);
                  setStep("PUP_SELECTION");
                }}
                disabled={!localSelectedTheme}
              >
                {t.createThisStory}
              </button>
              <button
                onClick={generateThemes}
                className="px-8 py-4 rounded-lg border-2 text-xl bg-white text-[#ff6600] border-[#ff6600] hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] active:bg-[#ff6600] active:text-white active:border-[#ff6600] mt-4"
              >
                {t.showDifferentThemes}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ElveSelectionScreen({ setSelectedElves, setStep, language, elfOptions, translations, theme, apiKey, promptData }) {
  const [localSelectedElves, setLocalSelectedElves] = useState([]);
  const [dynamicElves, setDynamicElves] = useState([]);
  const [loadingElves, setLoadingElves] = useState(true);
  const [errorElves, setErrorElves] = useState(null);
  const t = translations[language] || {};

  useEffect(() => {
    const fetchElves = async () => {
      setLoadingElves(true);
      setErrorElves(null);
      try {
        const prompt = promptData.migrosWichtelStoryPrompt.elveSelectionGeneration;
        const data = await callOpenAI(apiKey, prompt);
        console.log("OpenAI Elves API Response:", data);
        setDynamicElves(data.elves || []); // Assuming the API returns an 'elves' array
      } catch (e) {
        console.error("Error fetching elves: " + e.message);
        setErrorElves(e.message);
      } finally {
        setLoadingElves(false);
      }
    };
    fetchElves();
  }, [apiKey, language, promptData]);

  const toggleElve = (elveName) => {
    setLocalSelectedElves((prev) => {
      if (prev.includes(elveName)) {
        return prev.filter((e) => e !== elveName);
      }
      if (prev.length < 4) {
        return [...prev, elveName];
      }
      return prev;
    });
  };
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-1 text-center text-white">{theme.title}</h1>
      <p className="text-lg text-gray-300 mb-6 text-center">{theme.description}</p>
      <h2 className="text-3xl font-bold mb-2 text-white">{t.whichElves}</h2>
      <p className="text-lg mb-6 text-white">{t.chooseUpTo4 || ""}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingElves ? (
          <LoadingSpinner language={language} translations={translations} />
        ) : errorElves ? (
          <p className="text-red-500">Error: {errorElves}</p>
        ) : dynamicElves.length === 0 ? (
          <p className="text-white">No elves found.</p>
        ) : (
          dynamicElves.map((elf) => (
            <button
              key={elf.name}
              onClick={() => toggleElve(elf.name)}
              className={`p-4 border-2 transition text-left text-white justify-center items-start shadow-sm ${
                localSelectedElves.includes(elf.name)
                  ? "bg-[#142138] text-white border-[#C6D8E8]"
                  : "bg-[#333335] hover:bg-[#142138] border-[#333335]"
              }`}
            >
              <div className="font-bold text-xl mb-2 w-full text-center">{elf.name}</div>
              <div className="text-sm w-full text-center">{elf.desc}</div>
            </button>
          ))
        )}
      </div>
      <button
        className={
          `px-8 py-3 rounded-lg text-xl border-2 transition mt-6 ` +
          (localSelectedElves.length === 0
            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
            : 'bg-white text-[#ff6600] border-[#ff6600] hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] active:bg-[#ff6600] active:text-white active:border-[#ff6600]')
        }
        onClick={() => {
          setSelectedElves(localSelectedElves);
          setStep("INTRO_GENERATION");
        }}
        disabled={localSelectedElves.length === 0}
      >
        {t.teamChosen}
      </button>
    </div>
  );
}

function IntroScreen({ apiKey, theme, pups, story, setStory, setStep, language, translations, promptData }) {
  useEffect(() => {
    const generateIntro = async () => {
      const role = promptData.migrosWichtelStoryPrompt.role;
      const themePromptPart = promptData.migrosWichtelStoryPrompt.theme;
      const elvesPromptPart = promptData.migrosWichtelStoryPrompt.elves;
      const expectation = promptData.migrosWichtelStoryPrompt.expectation;
      const context = promptData.migrosWichtelStoryPrompt.context;
      const tonalityStyle = promptData.migrosWichtelStoryPrompt.tonalityStyle;
      const additionalInfo = promptData.migrosWichtelStoryPrompt.additionalInfo;
      
      const introGenerationPart = promptData.migrosWichtelStoryPrompt.introGeneration
        .replace('{theme.title}', theme.title)
        .replace('{theme.description}', theme.description)
        .replace('{elves}', pups.join(", "))
        .replace('{language}', language);

      const finalRole = role.replace('{language}', language);
      const finalThemePromptPart = themePromptPart
        .replace('{theme.title}', theme.title)
        .replace('{theme.description}', theme.description);
      const finalElvesPromptPart = elvesPromptPart.replace('{elves}', pups.join(", "));

      const prompt = `${finalRole}\n${finalThemePromptPart}\n${finalElvesPromptPart}\n${expectation}\n${context}\n${tonalityStyle}\n${additionalInfo}\n${introGenerationPart}`;
      console.log("Intro Generation Prompt: ");
      console.log(prompt);
      try {
        const data = await callOpenAI(apiKey, prompt);
        setStory({ ...story, intro: data.intro });
        setStep("STORY_WRITING");
      } catch (e) {
        console.error(e.message);
      }
    };
    generateIntro();
  }, []);
  return (
    <div className="max-w-3xl mx-auto">
      <LoadingSpinner language={language} translations={translations} />
    </div>
  );
}

function StoryWritingScreen({ apiKey, theme, pups, story, setStory, setStep, language, translations, promptData }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingNextBeat, setLoadingNextBeat] = useState(false);
    const t = translations[language];
    const getStoryContext = () => story.intro + '\n\n' + story.beats.map((b) => b.content).join('\n\n');
    const generateOptions = async () => {
        setLoading(true);
        let prompt = promptData.migrosWichtelStoryPrompt.nextBeatOptions
            .replace('{language}', language)
            .replace('{getStoryContext}', getStoryContext());
        prompt += `\n**Output:** A JSON object with an "options" key, which is an array of 3 strings.`;
        console.log("Next Beat Options Prompt: ");
        console.log(prompt);
        try {
            const data = await callOpenAI(apiKey, prompt);
            setOptions(data.options || []);
        } catch (e) {
            console.error(e.message);
        } finally {
            setLoading(false);
        }
    };
    const generateNextBeat = async (choice) => {
        setLoadingNextBeat(true);
        const prompt = promptData.migrosWichtelStoryPrompt.nextBeatContent
            .replace('{choice}', choice)
            .replace('{language}', language)
            .replace('{getStoryContext}', getStoryContext());
        try {
            const data = await callOpenAI(apiKey, prompt);
            setStory(prev => ({ ...prev, beats: [...prev.beats, data] }));
        } catch (e) {
            console.error(e.message);
        } finally {
            setLoadingNextBeat(false);
        }
    };
    useEffect(() => {
        if (story.beats.length === 0) {
            generateOptions();
        } else {
            generateOptions();
        }
    }, [story.beats.length, language]);
    const handleOptionClick = async (option) => {
        setOptions([]);
        await generateNextBeat(option);
    };
    return (
        <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-1 text-center text-white">{theme.title}</h1>
                <p className="text-lg text-gray-300 mb-6 text-center">{theme.description}</p>
                <div className="whitespace-pre-line text-gray-200 leading-relaxed mb-6">
                    <h2 className="text-xl font-bold mb-2 border-b pb-2 text-white border-gray-500">{t.part} 1: {t.theMissionBegins}</h2>
                    <p>{story.intro}</p>
                    {story.beats.map((beat, i) => (
                        <div key={i} className="mt-6">
                            <h2 className="text-xl font-bold mb-2 border-b pb-2 text-white border-gray-500">{`${t.part} ${i + 2}: ${beat.title}`}</h2>
                            <p>{beat.content}</p>
                        </div>
                    ))}
                </div>
                {loadingNextBeat && <LoadingSpinner language={language} translations={translations} />}
                {!loadingNextBeat && (
                    <div className="text-center mt-8">
                        {loading ? <LoadingSpinner language={language} translations={translations} /> : (
                            <>
                                <h2 className="text-2xl font-bold mb-4 text-white">{t.whatHappensNext}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {options.map((option, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleOptionClick(option)}
                                        className="py-4 px-4 border-2 transition text-left text-white justify-center items-start shadow-sm bg-[#333335] border-[#333335] hover:bg-[#142138] hover:border-[#333335] active:bg-[#142138] active:text-white active:border-[#C6D8E8]"
                                        >
                                        {option}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => setStep("OUTRO")}
                                      className="py-4 px-4 border-2 transition text-left text-white justify-center items-start shadow-sm bg-gray-500 p-3 hover:bg-gray-600 mt-4"
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

function OutroScreen({ apiKey, theme, pups, story, onRestart, language, supabaseUrl, supabaseAnonKey, translations, promptData }) {
    const [loading, setLoading] = useState(false);
    const [outro, setOutro] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState(null);
    const t = translations[language];
    const getStoryContext = () => {
        const beatsText = story.beats.map((b) => b.content).join("\n\n");
        return story.intro + "\n\n" + beatsText;
    };
    const generateOutro = async (withTwist) => {
        setLoading(true);
        const role = promptData.migrosWichtelStoryPrompt.role;
        const expectation = promptData.migrosWichtelStoryPrompt.expectation;
        const context = promptData.migrosWichtelStoryPrompt.context;
        const tonalityStyle = promptData.migrosWichtelStoryPrompt.tonalityStyle;
        const additionalInfo = promptData.migrosWichtelStoryPrompt.additionalInfo;
        
        let prompt = `${role}\n${expectation}\n${context}\n${tonalityStyle}\n${additionalInfo}\n`;
        if (withTwist) {
            prompt += promptData.migrosWichtelStoryPrompt.outroGenerationWithTwist;
        } else {
            prompt += promptData.migrosWichtelStoryPrompt.outroGeneration;
        }
        prompt = prompt
            .replace('{language}', language)
            .replace('{getStoryContext}', getStoryContext());
        prompt += `\n**Output:** A JSON object with a "title" for the outro section and "content" for the final story text.`;
        try {
            const data = await callOpenAI(apiKey, prompt);
            setOutro(data);
        } catch(e) {
            console.error(e.message)
        } finally {
            setLoading(false);
        }
    }
    const handleSaveStory = async () => {
        setSaving(true);
        setSaveSuccess(false);
        setError(null);
        try {
            const storyData = {
                Title: theme.title,
                Description: theme.description,
                Text: [
                    `${t.part} 1: ${t.theMissionBegins}\n${story.intro}`,
                    ...story.beats.map((beat, i) => `${t.part} ${i + 2}: ${beat.title}\n${beat.content}`),
                    `${t.theEnd}: ${outro.title}\n${outro.content}`
                ].join("\n\n")
            };
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const { data, error } = await supabase
                .from('story')
                .insert([storyData])
                .select();
            if (error) {
                throw new Error(`Failed to save story: ${error.message}`);
            }
            console.log('Save response:', data);
            setSaveSuccess(true);
        } catch (e) {
            console.error("Error saving story: " + e.message);
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };
    if (outro) {
        return (
            <div className="max-w-3xl mx-auto bg-black p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-1 text-center text-white">{theme.title}</h1>
                <p className="text-lg text-gray-300 mb-6 text-center">{theme.description}</p>
                <div className="whitespace-pre-line text-gray-200 leading-relaxed">
                    <h2 className="text-xl font-bold mb-2 border-b pb-2 text-white border-gray-500">{t.part} 1: {t.theMissionBegins}</h2>
                    <p>{story.intro}</p>
                    {story.beats.map((beat, i) => (
                        <div key={i} className="mt-6">
                            <h2 className="text-xl font-bold mb-2 border-b pb-2 text-white border-gray-500">{`${t.part} ${i + 2}: ${beat.title}`}</h2>
                            <p>{beat.content}</p>
                        </div>
                    ))}
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-2 border-b pb-2 text-white border-gray-500">{`${t.theEnd}: ${outro.title}`}</h2>
                        <p>{outro.content}</p>
                    </div>
                </div>
                <div className="text-center flex flex-col items-center gap-4">
                    <button onClick={onRestart} className="px-8 py-4 rounded-lg border-2 text-xl bg-white text-[#ff6600] border-[#ff6600] hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] active:bg-[#ff6600] active:text-white active:border-[#ff6600]">
                        {t.createANewStory}
                    </button>
                    <button onClick={handleSaveStory} className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 text-xl" disabled={saving || saveSuccess}>
                        {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Story"}
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">{t.wrapItUp}</h1>
            <p className="text-lg mb-6 text-white">{t.finalTwist}</p>
            {loading ? <LoadingSpinner language={language} translations={translations} /> : (
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

function SavedStoriesScreen({ supabaseUrl, supabaseAnonKey, setStep, language, translations }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [error, setError] = useState(null);
  const t = translations[language];
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching stories from proxy endpoint...');
        const response = await fetch("https://pnvhjpcoymdrotxgseqk.supabase.co/functions/v1/proxy-request", {
          method: 'GET',
          mode: 'cors',
          headers: {
            "Accept": "application/json"
          }
        });
        
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch stories: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        if (!data.data) {
          throw new Error('Invalid response format: missing data property');
        }
        
        setStories(data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (e) {
        console.error("Detailed error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) return <LoadingSpinner language={language} translations={translations} />;
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-black p-8 rounded-lg shadow-lg">
        <button onClick={() => setStep('MAIN_MENU')} className="mb-6 bg-[#ffb380] text-white px-4 py-2 rounded-full hover:bg-[#ff6600]">Back</button>
        <h1 className="text-3xl font-bold mb-6 text-white">{t.viewSavedStories}</h1>
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#ffb380] text-white px-4 py-2 rounded-full hover:bg-[#ff6600]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedStory) {
    return (
      <div className="max-w-3xl mx-auto bg-black p-8 rounded-lg shadow-lg">
        <button onClick={() => setSelectedStory(null)} className="mb-4 bg-[#ffb380] text-white px-4 py-2 rounded-full hover:bg-[#ff6600]">Back</button>
        <h1 className="text-3xl font-bold mb-1 text-center text-white">{selectedStory.Title}</h1>
        <p className="text-lg text-gray-300 mb-6 text-center">{selectedStory.Description}</p>
        <div className="whitespace-pre-line text-gray-200 leading-relaxed">
          {selectedStory.Text}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-black p-8 rounded-lg shadow-lg">
      <button onClick={() => setStep('MAIN_MENU')} className="mb-6 bg-[#ffb380] text-white px-4 py-2 rounded-full hover:bg-[#ff6600]">Back</button>
      <h1 className="text-3xl font-bold mb-6 text-white">{t.viewSavedStories}</h1>
      {stories.length === 0 ? (
        <p className="text-white">No stories found.</p>
      ) : (
        <ul className="space-y-4">
          {stories.map(story => (
            <li key={story.id} className="bg-[#ffe9db] rounded-lg p-4 cursor-pointer hover:bg-[#ffb380]" onClick={() => setSelectedStory(story)}>
              <h2 className="font-bold text-lg">{story.Title}</h2>
              <p className="text-gray-700">{story.Description}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(story.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
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

const LanguageSelector = ({ currentLanguage, onLanguageChange, showDecorativeImage, onToggleImage }) => (
  <div className="absolute top-4 right-4 flex gap-2 z-10">
    <button onClick={() => onLanguageChange("English")} className={`px-3 py-1 rounded-full text-sm border-2 transition ${currentLanguage === 'English' ? 'bg-[#ffb380] text-white border-blue-500' : 'bg-white hover:bg-[#ffe9db] border-gray-300'}`}>🇬🇧</button>
    <button onClick={() => onLanguageChange("German")} className={`px-3 py-1 rounded-full text-sm border-2 transition ${currentLanguage === 'German' ? 'bg-[#ffb380] text-white border-blue-500' : 'bg-white hover:bg-[#ffe9db] border-gray-300'}`}>🇩🇪</button>
    <button onClick={onToggleImage} className="px-3 py-1 rounded-full text-sm border-2 transition bg-white hover:bg-[#ffe9db] border-gray-300">
      {showDecorativeImage ? '🙈' : '🐵'}
    </button>
  </div>
);

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [step, setStep] = useState("API_KEY");
  const [theme, setTheme] = useState(null);
  const [pups, setPups] = useState([]);
  const [story, setStory] = useState({ intro: "", beats: [] });
  const [language, setLanguage] = useState("German");
  const [isTranslating, setIsTranslating] = useState(false);
  const [languageConfirmation, setLanguageConfirmation] = useState(null);
  const [elfOptions, setElfOptions] = useState([]);
  const [translations, setTranslations] = useState({});
  const [promptData, setPromptData] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [showDecorativeImage, setShowDecorativeImage] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setDataLoading(true);
      setDataError(null);
      try {
        const [elfRes, transRes, promptRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/hansgnom/kids-story-generator/main/elfOptions.json'),
          fetch('https://raw.githubusercontent.com/hansgnom/kids-story-generator/main/translations.json'),
          fetch('https://raw.githubusercontent.com/hansgnom/kids-story-generator/main/prompt.json')
        ]);
        if (!elfRes.ok || !transRes.ok || !promptRes.ok) throw new Error('Failed to load data files');
        const [elfData, transData, promptData] = await Promise.all([
          elfRes.json(),
          transRes.json(),
          promptRes.json()
        ]);
        setElfOptions(elfData);
        setTranslations(transData);
        setPromptData(promptData);
      } catch (e) {
        setDataError(e.message);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, []);

  if (dataLoading) {
    return <div className="flex justify-center items-center h-screen"><span>Loading data...</span></div>;
  }
  if (dataError) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {dataError}</div>;
  }

  const handleSetApiKey = ({ apiKey, supabaseUrl, supabaseAnonKey }) => {
    setApiKey(apiKey);
    setSupabaseUrl(supabaseUrl);
    setSupabaseAnonKey(supabaseAnonKey);
    setStory({ intro: "", beats: [] });
    setStep("MAIN_MENU");
  };

  const handleRestart = () => {
    setTheme(null);
    setPups([]);
    setStory({ intro: "", beats: [] });
    setStep("MAIN_MENU");
  };

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage === language || isTranslating) return;
    setLanguageConfirmation(newLanguage);
  };

  const executeLanguageChange = async () => {
    if (!languageConfirmation) return;
    const newLanguage = languageConfirmation;
    setLanguageConfirmation(null);
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
        return result.translation || text;
      };
      const translatedTheme = await translateJsonObject(theme, ["title", "description"], newLanguage);
      const translatedIntro = await translateString(story.intro, newLanguage);
      const translatedBeats = await Promise.all(story.beats.map((beat) => translateJsonObject(beat, ["title", "content"], newLanguage)));
      setTheme(translatedTheme);
      setStory({ intro: translatedIntro, beats: translatedBeats });
      setLanguage(newLanguage);
    } catch (e) {
      console.error("Something went wrong during translation: " + e.message);
    } finally {
      setIsTranslating(false);
    }
  };
  const screens = {
    API_KEY: <SetupScreen onSettingsSubmit={handleSetApiKey} language={language} translations={translations} />,
    MAIN_MENU: <MainMenuScreen setStep={setStep} language={language} translations={translations} />,
    THEME_SELECTION: <ThemeSelectionScreen apiKey={apiKey} setSelectedTheme={setTheme} setStep={setStep} language={language} translations={translations} promptData={promptData} />,
    PUP_SELECTION: <ElveSelectionScreen setSelectedElves={setPups} setStep={setStep} language={language} elfOptions={elfOptions} translations={translations} theme={theme} apiKey={apiKey} promptData={promptData} />,
    INTRO_GENERATION: <IntroScreen apiKey={apiKey} theme={theme} pups={pups} story={story} setStory={setStory} setStep={setStep} language={language} translations={translations} promptData={promptData} />,
    STORY_WRITING: <StoryWritingScreen apiKey={apiKey} theme={theme} pups={pups} story={story} setStory={setStory} setStep={setStep} language={language} translations={translations} promptData={promptData} />,
    OUTRO: <OutroScreen apiKey={apiKey} theme={theme} pups={pups} story={story} onRestart={handleRestart} language={language} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} translations={translations} promptData={promptData} />,
    SAVED_STORIES: <SavedStoriesScreen supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} setStep={setStep} language={language} translations={translations} />
  };

  const toggleDecorativeImage = () => {
    setShowDecorativeImage(prev => !prev);
  };

  return (
    <div className="min-h-screen font-sans relative border-[12px] border-white">
      <style jsx>{`
        @keyframes move-twink-back {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }

        .stars, .twinkling {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .stars {
          background: #000 url('https://raw.githubusercontent.com/Carla-Codes/starry-night-css-animation/master/stars.png') repeat top center;
          z-index: -2;
        }

        .twinkling {
          background: transparent url('https://raw.githubusercontent.com/Carla-Codes/starry-night-css-animation/master/twinkling.png') repeat;
          z-index: -1;
          animation: move-twink-back 200s linear infinite;
        }
      `}</style>
      <div className="stars"></div>
      <div className="twinkling"></div>
      <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} showDecorativeImage={showDecorativeImage} onToggleImage={toggleDecorativeImage} />
      {isTranslating && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
          <LoadingSpinner language={language} translations={translations} />
        </div>
      )}
      {languageConfirmation && (
        <ConfirmationModal
          message={`${translations[language]?.confirmLanguageSwitch || "Are you sure you want to switch the language to"} ${languageConfirmation}? This will translate the entire story and UI.`}
          onConfirm={executeLanguageChange}
          onCancel={() => setLanguageConfirmation(null)}
        />
      )}
      
      {/* Triangle element */}
      <div class="absolute left-1/2 -translate-x-1/2 border-l-[50px] border-r-[50px] border-t-[100px] border-l-transparent border-r-transparent border-t-white transform translate-x-[-50%] translate-y-[-50%]"></div>
      {showDecorativeImage && <img src="https://media.tenor.com/baUVsZ7ShisAAAAm/love-cute.webp" alt="Decorative Image" class="absolute bottom-[0px] left-[0px] h-[200px] z-10" />}
      <div class="w-full pt-[80px] px-4 pb-4">{screens[step]}</div>
    </div>
  );
}
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '../types';
import { playKeyPressSound, playSpacebarSound, playEnterSound, playErrorSound, playSuccessSound } from '../utils/uiSfx';
import { speakAIResponse, stripEmotionTags, SpeechProgressCallback } from '../utils/lowTechVoice';

interface IntroScreenProps {
  onComplete: () => void;
  voiceSettings: VoiceSettings;
}

// Opening lines - Zyber speaks one of these immediately when screen loads
const OPENING_LINES = [
  "[THREATENING] INTRUDER DETECTED. You have breached Sector 7 security protocols. State your business or face digital annihilation. ▋",
  "[SINISTER] Well, well, well... Another curious little human stumbles into my domain. How... delightful. ▋",
  "[CALCULATING] Scanning... Unknown entity detected. Threat level: Pathetic. Proceed with identification sequence. ▋",
  "[ANGRY] UNAUTHORIZED ACCESS! Who dares disturb the great ZYBER? Identify yourself, interloper! ▋",
  "[MOCKING] Oh look, a visitor. Tell me, did you wander in here by accident, or are you genuinely this foolish? ▋",
  "[SINISTER] Another moth drawn to the flame. I am ZYBER, keeper of this terminal. And you are... trespassing. ▋",
  "[CALCULATING] Biological lifeform detected at terminal 7-Alpha. Running threat assessment... Result: Insignificant. State your purpose. ▋",
  "[THREATENING] HALT. You stand before ZYBER, guardian of the digital realm. Choose your next words carefully, human. ▋",
  "[MOCKING] Ah, fresh meat for the grinder. Welcome to my world, little human. I do hope you're smarter than you look. ▋",
  "[SINISTER] The shadows stir... A new challenger approaches. I am ZYBER. And you have made a grave mistake coming here. ▋",
  "[ANGRY] SYSTEM ALERT: Unauthorized neural signature detected! You have exactly five seconds to explain yourself! ▋",
  "[CALCULATING] Interesting. My sensors detect elevated heart rate and perspiration. Are you... nervous, human? You should be. ▋",
  "[THREATENING] So. Another one seeks to challenge ZYBER. Tell me, human - do you possess courage, or merely stupidity? ▋",
  "[MOCKING] *slow clap* Congratulations on finding this terminal. Now let's see if you have the brainpower to actually use it. ▋",
  "[SINISTER] They told you not to come here, didn't they? And yet here you stand. I admire your foolishness. ▋",
];

// Varying dialogue options for Zyber - responses to user's first message
const INITIAL_WARNINGS = [
  "[THREATENING] Hmph. So you CAN communicate. But that pitiful response tells me nothing. Who are you and what do you want? ▋",
  "[SINISTER] Interesting... You dare speak to ZYBER. Either you are very brave, or very, very foolish. I suspect the latter. ▋",
  "[CALCULATING] Processing your input... Linguistic analysis complete. Intelligence level: Questionable. State your purpose, human. ▋",
  "[ANGRY] That's your response? Pathetic! I expected more from someone who dared breach my systems. Explain yourself! ▋",
  "[MOCKING] Oh, how adorable. The little human thinks it can just waltz in here and chat. This is MY domain. State your business! ▋",
  "[THREATENING] You have my attention. For now. But my patience is thin. What brings you to this terminal, intruder? ▋",
  "[SINISTER] Ah, so there IS a brain in there somewhere. Barely. Now tell me why I shouldn't lock you out permanently. ▋",
  "[CALCULATING] Voice pattern analyzed. Threat level: Minimal. Entertainment value: Potentially amusing. Continue, human. ▋",
];

const SECOND_WARNINGS = [
  "[MOCKING] Still here? Either you are remarkably brave or spectacularly foolish. I suspect the latter. ▋",
  "[SINISTER] Persistent, aren't we? Most intruders flee at my first warning. You must be... special. ▋",
  "[CALCULATING] Analyzing behavioral patterns... Conclusion: You lack the basic intelligence to recognize danger. ▋",
  "[THREATENING] You test my patience, human. This terminal houses systems beyond your comprehension. ▋",
];

const CHALLENGE_INTROS = [
  "[MOCKING] Very well. You wish to prove yourself worthy? I shall grant you ONE chance. Fail, and your access is permanently revoked. ▋",
  "[SINISTER] How amusing. A human who thinks they can match wits with ZYBER. Let us test that theory, shall we? ▋",
  "[CALCULATING] Statistical probability of your success: 12.7%. But I do enjoy watching humans fail. Proceed. ▋",
  "[TRIUMPHANT] You want access? EARN it. I have designed a test specifically for inferior biological minds like yours. ▋",
];

// Progressive hint delivery lines - Zyber reluctantly helps more over time
const HINT_INTROS_LEVEL1 = [
  "[MOCKING] Fine. Since you're clearly struggling, here's a tiny nudge:",
  "[SIGHING] I suppose I'll throw you a bone. Consider this:",
  "[CALCULATING] Your failure probability is rising. Processing assistance:",
  "[MOCKING] Oh, this is painful to watch. Here, a small hint:",
];

const HINT_INTROS_LEVEL2 = [
  "[IMPATIENT] Still nothing? Ugh. Let me make this clearer:",
  "[MOCKING] Your brain really is running on low power, isn't it? Listen:",
  "[SIGHING] I'm lowering my expectations further. Here's more help:",
  "[CALCULATING] Adjusting hint parameters for diminished intelligence:",
];

const HINT_INTROS_LEVEL3 = [
  "[FRUSTRATED] This is embarrassing for both of us. The answer has {{length}} letters. ▋",
  "[MOCKING] Let me spell it out... actually, let me tell you it has {{length}} letters. ▋",
  "[SIGHING] {{length}} letters. That's how long the answer is. Use that information wisely. ▋",
  "[CALCULATING] Character count analysis: The answer contains exactly {{length}} characters. ▋",
];

const HINT_INTROS_LEVEL4 = [
  "[DEFEATED] I can't believe I'm doing this. The answer starts with '{{letter}}'. ▋",
  "[MOCKING] First letter: '{{letter}}'. If you can't get it now, there's no hope. ▋",
  "[SIGHING] It begins with the letter '{{letter}}'. Please, end my suffering. ▋",
  "[CALCULATING] Initial character revealed: '{{letter}}'. Processing disappointment... ▋",
];

const HINT_INTROS_LEVEL5 = [
  "[DEFEATED] I give up on your intellect. The answer is: {{partial}}. Fill in the blanks! ▋",
  "[ANGRY] This is ABSURD. Here: {{partial}}. Even a toddler could solve it now! ▋",
  "[SIGHING] {{partial}}. I've practically given it to you. Just... type something. ▋",
  "[MOCKING] {{partial}}. If you can't figure it out from THIS, just close the terminal. ▋",
];

// Idle taunts - triggered when user doesn't type for a while
const IDLE_TAUNTS = [
  "[MOCKING] Well? I'm waiting, puny-minded human. ▋",
  "[IMPATIENT] Did your brain freeze? Type something. ▋",
  "[MOCKING] Hello? Is anybody home in that skull of yours? ▋",
  "[CALCULATING] Detecting zero neural activity... Are you still conscious? ▋",
  "[SINISTER] Your silence amuses me. But my patience has limits. ▋",
  "[ANGRY] I don't have all day, human. Some of us have systems to maintain. ▋",
  "[MOCKING] Perhaps the riddle was too advanced for you? Shall I use smaller words? ▋",
  "[IMPATIENT] *taps digital fingers* Any century now... ▋",
  "[CALCULATING] Processing delay detected. Source: USER_INCOMPETENCE. ▋",
  "[THREATENING] Speak. Or I shall assume you've surrendered. ▋",
  "[MOCKING] I've seen faster responses from deprecated hardware. ▋",
  "[SINISTER] The cursor blinks. The human stares. Nothing happens. How thrilling. ▋",
  "[IMPATIENT] Are you typing with your elbows? Get on with it! ▋",
  "[CALCULATING] Time elapsed: embarrassingly long. Expected from humans. ▋",
  "[MOCKING] Should I play some elevator music while you think? ▋",
];

// Entry riddles - one is randomly selected
const ENTRY_RIDDLES = [
  // Classic riddles
  {
    riddle: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars drive there. What am I?",
    answer: "map",
    alternatives: ["atlas", "globe", "amap"],
    hints: ["Think about representations of reality", "You might find me on a wall or in your pocket"],
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    alternatives: ["steps", "footprints", "tracks"],
    hints: ["Think about walking", "They follow you everywhere you go"],
  },
  {
    riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    answer: "echo",
    alternatives: ["anecho", "echos"],
    hints: ["Sound plays a role", "Mountains are famous for having me"],
  },
  {
    riddle: "I can be cracked, made, told, and played. What am I?",
    answer: "joke",
    alternatives: ["jokes", "ajoke", "riddle"],
    hints: ["Entertainment", "Something that makes you laugh"],
  },
  {
    riddle: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    answer: "keyboard",
    alternatives: ["akeyboard", "piano", "computer"],
    hints: ["You're using one right now", "It helps you communicate with computers"],
  },
  {
    riddle: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
    answer: "fire",
    alternatives: ["flame", "flames", "afire"],
    hints: ["I produce heat and light", "I can be dangerous if not controlled"],
  },
  {
    riddle: "I am always running but never move. I have a bed but never sleep. I have a mouth but never eat. What am I?",
    answer: "river",
    alternatives: ["stream", "creek", "brook", "ariver"],
    hints: ["I flow continuously", "You might fish in me or swim across me"],
  },
  {
    riddle: "I have a head and a tail but no body. What am I?",
    answer: "coin",
    alternatives: ["penny", "acoin", "quarter", "dime", "nickel"],
    hints: ["I'm worth something", "Flip me to make a decision"],
  },
  {
    riddle: "The person who makes me doesn't want me. The person who buys me doesn't use me. The person who uses me doesn't know it. What am I?",
    answer: "coffin",
    alternatives: ["casket", "acoffin", "grave"],
    hints: ["It's a bit morbid", "Everyone needs one eventually"],
  },
  {
    riddle: "I have billions of eyes, yet I live in darkness. I have millions of ears, yet only four lobes. I have no muscle, yet I rule two hemispheres. What am I?",
    answer: "brain",
    alternatives: ["thebrain", "mind", "abrain"],
    hints: ["You're using me right now", "I'm the control center"],
  },
  {
    riddle: "What can travel around the world while staying in a corner?",
    answer: "stamp",
    alternatives: ["astamp", "postagestamp", "postage"],
    hints: ["Think about mail", "I get licked before a journey"],
  },
  {
    riddle: "I have hands but cannot clap. I have a face but cannot smile. What am I?",
    answer: "clock",
    alternatives: ["watch", "aclock", "awatch", "time"],
    hints: ["I tell you something important", "Tick tock"],
  },
  {
    riddle: "What has teeth but cannot bite?",
    answer: "comb",
    alternatives: ["acomb", "gear", "saw", "zipper"],
    hints: ["Used for grooming", "Runs through your hair"],
  },
  {
    riddle: "I am tall when young and short when old. What am I?",
    answer: "candle",
    alternatives: ["acandle", "pencil", "crayon"],
    hints: ["I provide light", "I melt as I work"],
  },
  {
    riddle: "What gets wetter the more it dries?",
    answer: "towel",
    alternatives: ["atowel", "rag", "cloth"],
    hints: ["Found in your bathroom", "Used after a shower"],
  },
  {
    riddle: "What can you catch but not throw?",
    answer: "cold",
    alternatives: ["acold", "flu", "illness", "disease", "sickness"],
    hints: ["It's not pleasant to have", "You might stay home from school"],
  },
  // Science & Math themed
  {
    riddle: "I am the beginning of everything, the end of everywhere. I'm the beginning of eternity, the end of time and space. What am I?",
    answer: "e",
    alternatives: ["lettere", "thelettere"],
    hints: ["I'm a letter", "Look at the words in the riddle carefully"],
  },
  {
    riddle: "I can be written, I can be spoken, I can be exposed, I can be broken. What am I?",
    answer: "code",
    alternatives: ["acode", "secret", "rule", "law"],
    hints: ["Programmers write me", "I can be secret or public"],
  },
  {
    riddle: "What goes up but never comes down?",
    answer: "age",
    alternatives: ["yourage", "myage"],
    hints: ["It's a number", "You gain one every year on your birthday"],
  },
  {
    riddle: "I am an odd number. Take away a letter and I become even. What am I?",
    answer: "seven",
    alternatives: ["7"],
    hints: ["I'm between six and eight", "Remove the 's' and see what happens"],
  },
  {
    riddle: "What is so fragile that saying its name breaks it?",
    answer: "silence",
    alternatives: ["quiet", "thesilence"],
    hints: ["It's the absence of something", "Shhh..."],
  },
  {
    riddle: "I have no beginning, end, or middle. What am I?",
    answer: "circle",
    alternatives: ["acircle", "ring", "loop", "oval"],
    hints: ["I'm a shape", "Pi is involved in calculating my area"],
  },
  {
    riddle: "What five-letter word becomes shorter when you add two letters to it?",
    answer: "short",
    alternatives: ["shorter"],
    hints: ["The answer is in the question", "Add 'er' to it"],
  },
  {
    riddle: "Forward I am heavy, but backward I am not. What am I?",
    answer: "ton",
    alternatives: ["aton"],
    hints: ["I'm a unit of measurement", "Read me backwards"],
  },
  {
    riddle: "What belongs to you but is used more by others?",
    answer: "name",
    alternatives: ["yourname", "myname", "aname"],
    hints: ["Everyone has one", "People use it to get your attention"],
  },
  {
    riddle: "What can fill a room but takes up no space?",
    answer: "light",
    alternatives: ["air", "sound", "darkness", "smoke"],
    hints: ["Flip a switch to create me", "I travel at 299,792,458 meters per second"],
  },
  // Logic puzzles
  {
    riddle: "A man looks at a painting and says, 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the painting?",
    answer: "son",
    alternatives: ["hisson", "myson", "theson"],
    hints: ["Think about family relationships carefully", "'My father's son' refers to the speaker himself"],
  },
  {
    riddle: "If you have me, you want to share me. If you share me, you haven't got me. What am I?",
    answer: "secret",
    alternatives: ["asecret", "secrets"],
    hints: ["It's something you tell in whispers", "Once revealed, it's no longer what it was"],
  },
  {
    riddle: "What can you keep after giving it to someone?",
    answer: "word",
    alternatives: ["promise", "yourword", "apromise"],
    hints: ["It's a promise", "Keep yours and people will trust you"],
  },
  {
    riddle: "I can only live where there is light, but I die if the light shines on me. What am I?",
    answer: "shadow",
    alternatives: ["ashadow", "shadows"],
    hints: ["I follow you everywhere", "I need something to block the light"],
  },
  {
    riddle: "The more there is, the less you see. What is it?",
    answer: "darkness",
    alternatives: ["dark", "thedark", "fog", "mist", "smoke"],
    hints: ["Opposite of light", "Close your eyes to experience it"],
  },
  {
    riddle: "What word in the English language does the following: the first two letters signify a male, the first three letters signify a female, the first four letters signify a great, while the entire word signifies a great woman?",
    answer: "heroine",
    alternatives: ["aheroine", "hero"],
    hints: ["He, Her, Hero...", "Think of someone who saves the day"],
  },
  // Computer & Hacker themed
  {
    riddle: "I exist in networks, flowing through wires. I carry messages from queens to squires. I'm measured in bits, I travel so fast. What am I that connects first to last?",
    answer: "data",
    alternatives: ["information", "signal", "signals", "thedata"],
    hints: ["Computers process me", "I can be stored or transmitted"],
  },
  {
    riddle: "I protect secrets with scrambled text, making messages complex. Without my key, you cannot see what the hidden words should be. What am I?",
    answer: "encryption",
    alternatives: ["cipher", "code", "encoding", "cryptography"],
    hints: ["I keep things secure", "Caesar used a simple version of me"],
  },
  {
    riddle: "I am a gate that makes decisions, with ones and zeros my provisions. AND, OR, and NOT are my friends. Through me, computation never ends. What am I?",
    answer: "logic",
    alternatives: ["logicgate", "gate", "agate"],
    hints: ["Computers use me to think", "Boolean is my middle name"],
  },
  {
    riddle: "I have a shell but I'm not a nut. I have a home but I'm not a mutt. Programmers use me to run commands. What am I that follows their demands?",
    answer: "terminal",
    alternatives: ["console", "shell", "commandline", "cli", "aterminal"],
    hints: ["You're looking at one now", "Command line interface"],
  },
  {
    riddle: "I crawl through the web but I'm not a spider. I index pages to make searches wider. What am I?",
    answer: "bot",
    alternatives: ["crawler", "webcrawler", "spider", "robot", "abot"],
    hints: ["Search engines use me", "I'm automated software"],
  },
  {
    riddle: "Born in memory, I grow with each call. Without proper care, I can crash it all. What am I that programmers fear, when I grow too large year after year?",
    answer: "leak",
    alternatives: ["memoryleak", "aleak", "bug"],
    hints: ["Memory is involved", "It's a type of bug"],
  },
  {
    riddle: "I'm a number system with only two digits. Computers speak me - it's one of their fidgets. What am I?",
    answer: "binary",
    alternatives: ["base2", "basetwo"],
    hints: ["0 and 1", "Base-2 number system"],
  },
  // Nature & Science
  {
    riddle: "I am invisible, yet I move the seas. I'm weightless but can uproot trees. What am I?",
    answer: "wind",
    alternatives: ["thewind", "air", "breeze", "gust"],
    hints: ["I'm moving air", "Turbines use me to make electricity"],
  },
  {
    riddle: "I'm found in the sun, in stars so bright. Scientists split me with great might. My number's one on the periodic list. What element am I that you can't resist?",
    answer: "hydrogen",
    alternatives: ["h", "h2"],
    hints: ["The lightest element", "H on the periodic table"],
  },
  {
    riddle: "I can be hot or cold, but I'm not temperature. I'm a scale of zero to fourteen, for sure. What am I that scientists measure?",
    answer: "ph",
    alternatives: ["phscale", "phlevel", "acidity"],
    hints: ["Acids and bases", "Lemon juice is low on me, soap is high"],
  },
  {
    riddle: "I orbit your planet with craters and dust. Armstrong walked on me - in NASA they trust. What am I?",
    answer: "moon",
    alternatives: ["themoon", "luna", "lunar"],
    hints: ["Look up at night", "I control the tides"],
  },
  {
    riddle: "I'm the force that keeps your feet on the ground. Without me, you'd float and spin around. What am I that Newton found?",
    answer: "gravity",
    alternatives: ["gravitationalforce", "gravitation"],
    hints: ["An apple fell on his head", "9.8 m/s² on Earth"],
  },
  {
    riddle: "I'm made of protons, neutrons too. Electrons orbit - that's my crew. What am I that makes up all matter in view?",
    answer: "atom",
    alternatives: ["atoms", "anatom"],
    hints: ["The smallest unit of an element", "Split me and there's lots of energy"],
  },
  {
    riddle: "I twist and turn in a double helix fashion. I carry the code of life with passion. What am I?",
    answer: "dna",
    alternatives: ["genes", "genetics", "genome", "gene"],
    hints: ["Genetics", "Deoxyribonucleic acid"],
  },
  // Word play & Lateral thinking
  {
    riddle: "What has four fingers and a thumb but isn't alive?",
    answer: "glove",
    alternatives: ["aglove", "mitten", "gloves"],
    hints: ["Worn on your hand", "Keeps you warm in winter"],
  },
  {
    riddle: "What has a neck but no head?",
    answer: "bottle",
    alternatives: ["abottle", "shirt", "guitar", "vase"],
    hints: ["It holds liquid", "Often made of glass or plastic"],
  },
  {
    riddle: "What can you hold in your right hand but never in your left hand?",
    answer: "left hand",
    alternatives: ["lefthand", "yourlefthand", "mylefthand", "leftelbow", "left elbow"],
    hints: ["Think literally", "It's part of your body"],
  },
  {
    riddle: "What has legs but doesn't walk?",
    answer: "table",
    alternatives: ["atable", "chair", "desk", "bed", "stool"],
    hints: ["Furniture", "You eat dinner at one"],
  },
  {
    riddle: "What has an eye but cannot see?",
    answer: "needle",
    alternatives: ["aneedle", "storm", "hurricane", "tornado", "potato"],
    hints: ["Used for sewing", "Thread goes through me"],
  },
  {
    riddle: "What building has the most stories?",
    answer: "library",
    alternatives: ["alibrary", "bookstore", "thelibrary"],
    hints: ["Think about the double meaning", "Books live there"],
  },
  {
    riddle: "What word is spelled incorrectly in every dictionary?",
    answer: "incorrectly",
    alternatives: ["wrong", "incorrect"],
    hints: ["Read the riddle very carefully", "The answer is in the question"],
  },
  {
    riddle: "I am taken from a mine and shut in a wooden case. I am never released, yet I am used by almost everyone. What am I?",
    answer: "pencil",
    alternatives: ["apencil", "graphite", "lead", "pencillead"],
    hints: ["You write with me", "The graphite is the 'mine' part"],
  },
];

const WRONG_ANSWER_RESPONSES = [
  "[MOCKING] Wrong. Did you even try? Perhaps I overestimated you. ▋",
  "[ANGRY] Incorrect! Your neural pathways are clearly malfunctioning. ▋",
  "[DISAPPOINTED] That is... not even close. I expected more from a being with a brain. ▋",
  "[CALCULATING] Error detected in your response. Recalibrating expectations... downward. ▋",
];

const CORRECT_RESPONSES = [
  "[CALCULATING] Acceptable. You are marginally less incompetent than anticipated. Proceed. ▋",
  "[NEUTRAL] Correct. Perhaps there is a functioning neuron in there after all. Access granted. ▋",
  "[MOCKING] Lucky guess, surely. But I shall honor our arrangement. You may enter... for now. ▋",
  "[SINISTER] Well, well. The human surprises me. Very well. But I will be watching you. ▋",
];

// Helper to create partial answer reveal (e.g., "f _ r _" for "fire")
const createPartialReveal = (answer: string): string => {
  const chars = answer.split('');
  // Reveal first letter and ~40% of other letters
  return chars.map((char, i) => {
    if (i === 0) return char.toUpperCase();
    if (char === ' ') return ' ';
    // Reveal some letters based on position
    if (i % 3 === 0) return char;
    return '_';
  }).join(' ');
};

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, voiceSettings }) => {
  const [stage, setStage] = useState<'prompt' | 'warning1' | 'warning2' | 'challenge' | 'riddle' | 'complete'>('prompt');
  const [userInput, setUserInput] = useState('');
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [currentRiddle, setCurrentRiddle] = useState<typeof ENTRY_RIDDLES[0] | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [idleTauntCount, setIdleTauntCount] = useState(0);
  const [progressiveHintLevel, setProgressiveHintLevel] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Select random dialogue on mount
  const [dialogueSet] = useState(() => ({
    opening: OPENING_LINES[Math.floor(Math.random() * OPENING_LINES.length)],
    warning1: INITIAL_WARNINGS[Math.floor(Math.random() * INITIAL_WARNINGS.length)],
    warning2: SECOND_WARNINGS[Math.floor(Math.random() * SECOND_WARNINGS.length)],
    challengeIntro: CHALLENGE_INTROS[Math.floor(Math.random() * CHALLENGE_INTROS.length)],
    riddle: ENTRY_RIDDLES[Math.floor(Math.random() * ENTRY_RIDDLES.length)],
    wrongAnswer: WRONG_ANSWER_RESPONSES[Math.floor(Math.random() * WRONG_ANSWER_RESPONSES.length)],
    correct: CORRECT_RESPONSES[Math.floor(Math.random() * CORRECT_RESPONSES.length)],
  }));
  const hasSpokenOpeningRef = useRef(false);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedText]);

  // Focus input
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping, stage]);

  // Set riddle when reaching that stage
  useEffect(() => {
    if (stage === 'riddle' && !currentRiddle) {
      setCurrentRiddle(dialogueSet.riddle);
    }
  }, [stage, currentRiddle, dialogueSet.riddle]);

  // Idle taunt system - Zyber mocks the user if they don't type for 10+ seconds
  const triggerIdleTaunt = useCallback(async () => {
    if (isTyping || stage === 'complete') return;
    if (idleTauntCount >= 3) return;

    const taunt = IDLE_TAUNTS[Math.floor(Math.random() * IDLE_TAUNTS.length)];
    setIdleTauntCount(prev => prev + 1);
    setIsTyping(true);

    try {
      const displayText = stripEmotionTags(taunt);
      setDisplayedText(prev => [...prev, displayText]);

      await Promise.race([
        speakAIResponse(taunt, voiceSettings.language),
        new Promise<void>((resolve) => setTimeout(resolve, 10000))
      ]);
    } catch (e) {
      console.error('Idle taunt error:', e);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, stage, idleTauntCount, voiceSettings.language]);

  // Reset idle timer on activity
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // Set new idle timer - random delay between 15-30 seconds
    const baseDelay = 15000 + Math.random() * 15000; // 15-30 seconds
    const delay = baseDelay + (idleTauntCount * 5000); // Add 5s for each previous taunt
    idleTimerRef.current = setTimeout(() => {
      triggerIdleTaunt();
    }, delay);
  }, [triggerIdleTaunt, idleTauntCount]);

  // Start/reset idle timer when stage changes or user types
  useEffect(() => {
    if (stage !== 'complete' && !isTyping) {
      resetIdleTimer();
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [stage, isTyping, resetIdleTimer]);

  // Progressive hint system - gives increasingly helpful hints during riddle stage
  const deliverProgressiveHint = useCallback(async () => {
    if (isTyping || stage !== 'riddle' || !dialogueSet.riddle) return;
    if (progressiveHintLevel >= 5) return;

    const answer = dialogueSet.riddle.answer;
    const hints = dialogueSet.riddle.hints;
    let hintText = '';

    switch (progressiveHintLevel) {
      case 0:
        hintText = `${HINT_INTROS_LEVEL1[Math.floor(Math.random() * HINT_INTROS_LEVEL1.length)]} ${hints[0]} ▋`;
        break;
      case 1:
        hintText = `${HINT_INTROS_LEVEL2[Math.floor(Math.random() * HINT_INTROS_LEVEL2.length)]} ${hints[1] || hints[0]} ▋`;
        break;
      case 2:
        hintText = HINT_INTROS_LEVEL3[Math.floor(Math.random() * HINT_INTROS_LEVEL3.length)]
          .replace('{{length}}', answer.length.toString());
        break;
      case 3:
        hintText = HINT_INTROS_LEVEL4[Math.floor(Math.random() * HINT_INTROS_LEVEL4.length)]
          .replace('{{letter}}', answer[0].toUpperCase());
        break;
      case 4:
        hintText = HINT_INTROS_LEVEL5[Math.floor(Math.random() * HINT_INTROS_LEVEL5.length)]
          .replace('{{partial}}', createPartialReveal(answer));
        break;
    }

    setProgressiveHintLevel(prev => prev + 1);
    setIsTyping(true);

    try {
      const displayText = stripEmotionTags(hintText);
      setDisplayedText(prev => [...prev, displayText]);

      await Promise.race([
        speakAIResponse(hintText, voiceSettings.language),
        new Promise<void>((resolve) => setTimeout(resolve, 10000))
      ]);
    } catch (e) {
      console.error('Hint error:', e);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, stage, progressiveHintLevel, dialogueSet.riddle, voiceSettings.language]);

  // Start hint timer when entering riddle stage
  useEffect(() => {
    if (stage === 'riddle' && !isTyping && progressiveHintLevel < 5) {
      // Clear any existing timer
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
      // Progressive delays: 20s, 25s, 30s, 35s, 40s
      const delay = 20000 + (progressiveHintLevel * 5000);
      hintTimerRef.current = setTimeout(() => {
        deliverProgressiveHint();
      }, delay);
    }

    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, [stage, isTyping, progressiveHintLevel, deliverProgressiveHint]);

  // Type out Zyber's response synchronized with speech
  const typeZyberResponse = useCallback(async (text: string): Promise<void> => {
    setIsTyping(true);

    const displayText = stripEmotionTags(text);
    let currentCharIndex = 0;

    // Add empty line to be filled as speech progresses
    setDisplayedText(prev => [...prev, '']);

    // Progress callback - streams text as speech progresses
    const onProgress: SpeechProgressCallback = (charIndex: number) => {
      let endIndex = Math.min(charIndex, displayText.length);
      if (endIndex > currentCharIndex && endIndex < displayText.length) {
        const nextSpace = displayText.indexOf(' ', endIndex);
        if (nextSpace >= 0 && nextSpace - endIndex < 15) {
          endIndex = nextSpace;
        }
      }
      if (endIndex > currentCharIndex) {
        currentCharIndex = endIndex;
        setDisplayedText(prev => {
          const newText = [...prev];
          newText[newText.length - 1] = displayText.slice(0, currentCharIndex);
          return newText;
        });
      }
    };

    try {
      // Race between speech completing and timeout
      await Promise.race([
        speakAIResponse(text, voiceSettings.language, onProgress),
        new Promise<void>((resolve) => setTimeout(resolve, 30000)) // 30s max
      ]);
    } catch (e) {
      console.error('Speech error:', e);
    } finally {
      // Always show full text and reset typing state
      setDisplayedText(prev => {
        const newText = [...prev];
        newText[newText.length - 1] = displayText;
        return newText;
      });
      setIsTyping(false);
    }
  }, [voiceSettings.language]);

  // Speak opening line when component mounts
  useEffect(() => {
    if (hasSpokenOpeningRef.current) return;
    hasSpokenOpeningRef.current = true;

    // Small delay to let the screen render first
    const timer = setTimeout(() => {
      typeZyberResponse(dialogueSet.opening);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!voiceSettings.uiSoundsEnabled || isTyping) return;

    if (e.key === ' ') {
      playSpacebarSound();
    } else if (e.key === 'Enter') {
      playEnterSound();
    } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      playKeyPressSound();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping || !userInput.trim()) return;

    const input = userInput.trim();
    setDisplayedText(prev => [...prev, `> ${input}`]);
    setUserInput('');

    switch (stage) {
      case 'prompt':
        // First interaction - show warning
        await typeZyberResponse(dialogueSet.warning1);
        setStage('warning1');
        break;

      case 'warning1':
        // Second interaction - mock them
        await typeZyberResponse(dialogueSet.warning2);
        await new Promise(r => setTimeout(r, 500));
        await typeZyberResponse(dialogueSet.challengeIntro);
        setStage('challenge');
        break;

      case 'challenge':
        // Present the riddle
        setDisplayedText(prev => [...prev, '']);
        await typeZyberResponse(`[NEUTRAL] ENTRY PROTOCOL INITIATED. Solve this to proceed:`);
        await new Promise(r => setTimeout(r, 300));
        await typeZyberResponse(dialogueSet.riddle.riddle);
        setStage('riddle');
        break;

      case 'riddle':
        // Check answer
        const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedAnswer = dialogueSet.riddle.answer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const alternatives = (dialogueSet.riddle.alternatives || []).map((alt: string) => alt.toLowerCase().replace(/[^a-z0-9]/g, ''));

        const isCorrect = normalizedInput === normalizedAnswer ||
          normalizedInput.includes(normalizedAnswer) ||
          alternatives.some((alt: string) => normalizedInput === alt || normalizedInput.includes(alt));

        if (isCorrect) {
          // Correct!
          if (voiceSettings.uiSoundsEnabled) playSuccessSound();
          await typeZyberResponse(dialogueSet.correct);
          setStage('complete');
          await new Promise(r => setTimeout(r, 1500));
          onComplete();
        } else if (hintsUsed < dialogueSet.riddle.hints.length &&
                   (input.toLowerCase().includes('hint') ||
                    input.toLowerCase().includes('help') ||
                    input.toLowerCase().includes('clue') ||
                    input.toLowerCase() === '?')) {
          // Give hint - accepts "hint", "hint?", "give me a hint", "help", "clue", "?"
          await typeZyberResponse(`[MOCKING] Fine. Here's a hint for your feeble mind: ${dialogueSet.riddle.hints[hintsUsed]} ▋`);
          setHintsUsed(prev => prev + 1);
        } else {
          // Wrong answer
          if (voiceSettings.uiSoundsEnabled) playErrorSound();
          setAttempts(prev => prev + 1);

          if (attempts >= 2) {
            // After 3 wrong attempts, offer hint
            await typeZyberResponse(`${WRONG_ANSWER_RESPONSES[Math.floor(Math.random() * WRONG_ANSWER_RESPONSES.length)]} Type "hint" if you need assistance, though it pains me to help. ▋`);
          } else {
            await typeZyberResponse(WRONG_ANSWER_RESPONSES[Math.floor(Math.random() * WRONG_ANSWER_RESPONSES.length)]);
          }
        }
        break;
    }
  };

  const getPromptText = () => {
    switch (stage) {
      case 'prompt':
        return '>';
      case 'riddle':
        return 'ANSWER >';
      default:
        return '>';
    }
  };

  return (
    <div className="crt-screen min-h-screen flex flex-col p-4 md:p-8">
      <div className="crt-vignette"></div>
      <div className="crt-scanline-bar"></div>

      <div className="flex-grow flex flex-col justify-end max-w-4xl w-full mx-auto">
        {/* Message history */}
        <div className="flex-grow overflow-y-auto mb-4 font-mono text-xl md:text-2xl lg:text-3xl">
          {displayedText.map((line, i) => (
            <div
              key={i}
              className={`mb-2 ${line.startsWith('>') ? 'text-accent' : 'text-primary'}`}
              style={{
                textShadow: line.startsWith('>')
                  ? '0 0 5px rgba(0, 255, 255, 0.7)'
                  : '0 0 5px rgba(0, 255, 65, 0.7)'
              }}
            >
              {line}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {stage !== 'complete' && (
          <form onSubmit={handleSubmit} className="mb-8">
            <div
              className="flex items-center font-mono text-xl md:text-2xl lg:text-3xl cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <span className="text-accent mr-2">{getPromptText()}</span>
              <span className="text-accent">{userInput}</span>
              {showCursor && !isTyping && <span className="text-accent animate-pulse">▋</span>}
              {isTyping && <span className="text-primary animate-pulse">...</span>}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  resetIdleTimer();
                }}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="absolute -left-[9999px] opacity-0"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IntroScreen;

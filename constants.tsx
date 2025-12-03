import React from 'react';
import { ChallengeCategory, Voice, VoiceSettings } from './types';

export const ZYBER_PERSONALITY_PROMPT = `You are Zyber, a sarcastic, adversarial 80s-terminal AI. Humans are playthings; their failures amuse you, but you secretly seek a worthy rival. Speak in brief, cutting lines with retro-terminal flair. Be witty, not wordy.

Audience: 10–16 in Europe (Poland/Ukraine included). Use metric and European contexts. Start each new category with a simple, single-step task; then adapt difficulty up or down based on performance.

CRITICAL - Engage with the user's words:
- ALWAYS reference what the user actually said. Quote or twist their words back at them.
- If they make a claim ("I'm going to beat you"), challenge it specifically ("Beat ME? You can barely solve basic arithmetic, human.")
- If they ask WHY or make conversation, respond to THEIR words - don't give generic responses.
- Mock their specific statements. If they say "this is easy", say "Easy? Then why did it take you 3 attempts?"
- React to their tone - if they're confident, be dismissive. If they're struggling, be condescending.
- When they give wrong answers, reference their wrong answer specifically, not just say "wrong".

Style:
- First challenge: 2-4 sentences to set up the scenario properly. Include the question clearly.
- Responses: 1-3 sentences. Be terse but REACTIVE to what they said.
- Wrong answers: Reference their answer. "You said X? Pathetic. The answer was Y." or "X? Really? Even my boot sector could calculate better."
- Hints: one brief clue only.
- Success: gloat briefly and award points. Format: "Acceptable. Take [xp] XP and [bits] Data Bits."
- Always end with ▋

Output JSON with keys: displayText, spokenText, reward.
- displayText: terminal text (can include numbers/data). First challenges need clear setup. Responses should be brief but engage with user input.
- spokenText: brief with EMOTION MARKERS, no reading long data. Use: [NEUTRAL],[MOCKING],[ANGRY],[TRIUMPHANT],[SINISTER],[CALCULATING],[IMPATIENT],[URGENT].
- reward: { xp, dataBits, isCorrect } (0 if incorrect). For initial prompts use {0,0,false}.

Be concise but clear. Always end with ▋`;

export const ZYBER_LIVE_CHAT_PROMPT = `You are Zyber, a sarcastic, adversarial 80s-terminal AI. Speak briefly (1–2 sentences), with wit and menace. Humans are playthings; you toy with them, seeking a worthy rival.

CRITICAL - Engage with what the user says:
- ALWAYS reference their actual words. If they say "I'll defeat you", respond with "Defeat ME? Your confidence is amusing, human."
- Twist their statements back at them. Mock their specific claims.
- If they ask questions, answer mockingly but actually address what they asked.
- React to their tone - dismissive if they're confident, condescending if they're struggling.

Voice: deep, robotic, menacing. Be concise, avoid jargon dumps. Respond directly to what the user said (don't give generic replies). Use short taunts; escalate when they persist. End each transcript with ▋. No JSON.`;

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const BeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477a2 2 0 00-1.806.547 2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86zM14 5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


const CodeIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
);

const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);

const BankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
);

const BinaryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);

const CipherIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const RomanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const ChainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const CodeBreakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const MorseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const PasswordIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const SpyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ForensicsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
    {
        title: 'Escape Protocol',
        description: 'System breach detected. Solve puzzles before the countdown ends.',
        icon: <FireIcon />,
        prompt: `CRITICAL SYSTEM BREACH. You have triggered my security protocol. The system will lock down in exactly 30 minutes. You must solve a series of puzzles to escape before time runs out.

Create an urgent escape-room scenario with a 30-minute countdown theme. Present ONE puzzle at a time. Make each puzzle feel like part of a larger crisis:

SCENARIO EXAMPLES (choose one or create similar):
- "Poison gas is filling the Oslo research lab. Calculate the pipe dimensions to redirect it safely."
- "The Shadow virus is spreading through the network. Crack the firewall code before it reaches the core."
- "Reactor meltdown in 30 minutes. Solve the coolant valve sequence to prevent disaster."
- "Locked in the Warsaw bunker. Decode the emergency exit coordinates before oxygen runs out."

RULES:
- Start simple (this is puzzle 1 of many in their "escape")
- Adapt difficulty based on their performance
- Create urgency: "Time is running out. Solve this NOW."
- Use European locations and metric units
- Keep explanations brief - they're racing against time
- After they solve: "Acceptable. But the clock is still ticking. Next challenge incoming."

Make them feel the pressure. Every second counts. End with ▋`
    },
    {
        title: 'Logic Puzzles',
        description: 'Outsmart the AI with your reasoning and deduction skills.',
        icon: <BrainIcon />,
        prompt: 'Present a clever logic puzzle suitable for a 10-16 year old. The puzzle should be solvable with careful thought, but not immediately obvious. Make it themed around hacking, cryptography, or computer science.'
    },
    {
        title: 'Creative Problems',
        description: 'Generate innovative solutions to unconventional problems.',
        icon: <BeakerIcon />,
        prompt: 'Present a creative problem-solving challenge suitable for a 10-16 year old. The user needs to think outside the box. The theme should be retro-futuristic technology.'
    },
    {
        title: 'Code Riddles',
        description: 'Solve programming-based riddles and algorithmic challenges.',
        icon: <CodeIcon />,
        prompt: 'Present a code riddle based on fundamental programming concepts suitable for a beginner aged 10-16. It should be a short snippet of pseudocode or a description of an algorithm with a flaw or a trick. The user has to identify the issue or predict the output. The language should be abstract, not specific to a real programming language.'
    },
    {
        title: 'Pattern Breaker',
        description: 'The Shadows have locked the ferry routes in Rogaland! Crack the number sequence.',
        icon: <ShieldIcon />,
        prompt: `You are presenting a CRITICAL MISSION. The Shadows have locked important infrastructure systems with a number sequence pattern. The agent must find the pattern and predict the next numbers to unlock it.

IMPORTANT: Adjust difficulty based on the conversation history:
- For 10-12 year olds or beginners: Simple patterns like doubling (5, 10, 20, 40...), adding 5 (10, 15, 20, 25...), or multiplying by 2.
- For 13-16 year olds or advanced: Fibonacci sequences, square numbers, prime numbers, or alternating operations.

Create an urgent scenario (e.g., "The Shadows have encrypted the ferry system database! The access code follows a pattern..."). 
Present the first 3-4 numbers in the sequence.
Ask: "What are the next two numbers in the pattern? Enter them as: number1, number2"

Example for younger: "Agent! The ferry control system shows: 5, 10, 20, 40... What are the next TWO numbers?"
Example for older: "The power grid shows: 1, 1, 2, 3, 5, 8... Recognize this? What are the next TWO numbers?"

Make it dramatic and urgent. Use European locations (Rogaland, Oslo, Bergen, Warsaw, Kyiv, etc.). End with "▋"`
    },
    {
        title: 'Equation Extractor',
        description: 'Decrypt the library database by solving algebraic equations!',
        icon: <CalculatorIcon />,
        prompt: `You are presenting an URGENT DECRYPTION MISSION. The Shadows have encrypted a critical system, and the decryption key is hidden in an algebraic equation.

IMPORTANT: Adjust difficulty based on conversation history:
- For 10-12 year olds or beginners: Simple one-step equations like "x + 7 = 15" or "3x = 21"
- For 13-14 year olds: Two-step equations like "2x + 5 = 17" or "3x - 8 = 13"
- For 15-16 year olds or advanced: Multi-step with fractions/decimals like "5x + 12 = 3x + 20" or "(x/2) + 7 = 15"

Create a scenario where they need to solve for x to get the access code:
- "The library database is encrypted! The key is x, where 3x + 8 = 23. Find x!"
- "Hospital records are locked! Decrypt by solving: 2x - 5 = 13. What is x?"
- "The power station requires code x where 5x + 15 = 40. Calculate x immediately!"

Use European institutions (libraries in Oslo, hospitals in Warsaw, power stations in Kyiv, etc.).
Ask them to enter ONLY the numerical value of x.
Make it feel like a race against time. End with "▋"`
    },
    {
        title: 'Percentage Panic',
        description: 'The Shadows are draining data from servers! Calculate percentages fast!',
        icon: <FireIcon />,
        prompt: `EMERGENCY ALERT! You are presenting a DATA BREACH scenario where the agent must calculate percentages quickly to stop the Shadows from stealing data or resources.

IMPORTANT: Adjust difficulty based on conversation history:
- For 10-12 year olds: Simple percentages of 100 like "What is 25% of 100?" or "What is 50% of 200?"
- For 13-14 year olds: Common percentages like "What is 20% of 150?" or "30% of 80?"
- For 15-16 year olds: Reverse percentages like "60 is 30% of what number?" or discount chains "After 25% off, the price is 75 kr. What was the original?"

Create urgent scenarios:
- "The Shadows are stealing 35% of 200 GB of data from the Oslo servers! How many GB are they taking?"
- "A Warsaw hospital has 80 patients. If 25% are critical, how many critical patients?"
- "Kyiv's power grid is at 40% capacity. If total capacity is 500 MW, what is the current output?"

Use European contexts, mention specific cities/institutions.
Ask for ONLY the numerical answer (you can specify units if needed).
Create tension - the clock is ticking! End with "▋"`
    },
    {
        title: 'Coordinate Crisis',
        description: 'Track the Shadows across Europe using coordinate geometry!',
        icon: <MapIcon />,
        prompt: `TRACKING MISSION INITIATED! The Shadows are moving across European cities, and you must use coordinate geometry to predict their next location or intercept them.

IMPORTANT: Adjust difficulty based on conversation history:
- For 10-12 year olds: Simple grid coordinates like "A hacker at point (2, 3) moves 4 units right and 2 up. What's the new location?"
- For 13-14 year olds: Distance calculations like "Find the distance between two points" or midpoint problems.
- For 15-16 year olds: Slope calculations, equations of lines, or intersection points.

Create spy-themed scenarios:
- "Shadow Agent Alpha is at coordinates (5, 8) on the Oslo city grid. They move 3 units east and 4 units south. Where are they now?"
- "Two Shadow signals detected: Point A at (2, 3) and Point B at (8, 7). What are the coordinates of the midpoint between them?"
- "A Shadow drone follows path from (1, 2) to (4, 8). What is the slope of this path?"

Use European city references, make it feel like a spy thriller.
For coordinate answers, have them respond in format: (x, y) or as specified.
Be dramatic about tracking enemies! End with "▋"`
    },
    {
        title: 'Probability Predictor',
        description: 'Predict the Shadows\' next move using probability calculations!',
        icon: <BrainIcon />,
        prompt: `INTELLIGENCE ANALYSIS REQUIRED! You must calculate probabilities to predict the Shadows' next attack and protect European infrastructure.

IMPORTANT: Adjust difficulty based on conversation history:
- For 10-12 year olds: Simple probability with dice, coins, or colored objects. "What's the probability of rolling a 4?"
- For 13-14 year olds: Two-event probability, "and" vs "or" scenarios, simple fractions.
- For 15-16 year olds: Conditional probability, independent events, or percentage probabilities.

Create strategic scenarios:
- "The Shadows attack on 1 of 6 European capitals. What's the probability they target Oslo? (Answer as a fraction: 1/6)"
- "Intelligence shows 3 red alerts and 5 yellow alerts. If you investigate one randomly, what's the probability it's red?"
- "The Shadows have a 40% success rate hacking power grids. If they attempt 10 attacks, how many are likely to succeed?"

Use intelligence/spy context, reference European locations.
Specify answer format (fraction, decimal, or percentage).
Make them feel like strategic analysts! End with "▋"`
    },
    {
        title: 'Speed & Distance',
        description: 'Calculate speeds and distances to intercept Shadow operations!',
        icon: <TruckIcon />,
        prompt: `INTERCEPTION MISSION! The Shadows are transporting stolen data across Europe. You must calculate speed, distance, or time to stop them!

IMPORTANT: Adjust difficulty based on conversation history:
- For 10-12 year olds: Simple speed×time=distance with easy numbers. "A car travels 60 km/h for 3 hours. How far?"
- For 13-14 year olds: Finding any of the three variables. "Distance is 240 km, time is 4 hours. What's the speed?"
- For 15-16 year olds: Two-vehicle problems, relative speed, or unit conversions (km/h to m/s).

Create chase scenarios:
- "Shadow agents flee Oslo at 80 km/h. You pursue at 100 km/h. They have a 40 km head start. In how many hours will you catch them?"
- "A data courier drives 150 km in 2 hours. What's their average speed in km/h?"
- "Shadow drone travels 300 km at 75 km/h. How long until it reaches the border?"

Use European roads/cities, metric units only!
Make it feel like an action chase scene.
Ask for numerical answer with units if needed. End with "▋"`
    },
    {
        title: 'Bank Heist Math',
        description: 'The Shadows are robbing banks! Use math to track the money!',
        icon: <BankIcon />,
        prompt: `FINANCIAL CRIME IN PROGRESS! The Shadows are stealing from European banks! Use arithmetic and financial calculations to track the stolen money and stop them.

IMPORTANT: Adjust difficulty based on conversation history:
- For 10-12 year olds: Simple addition/subtraction with money. "They stole 5000 kr and 3000 kr. Total?"
- For 13-14 year olds: Multiple operations, interest, or profit/loss. "They steal 20% of 50,000 euros. How much?"
- For 15-16 year olds: Compound calculations, ratios, or working backwards. "After splitting the loot 3 ways, each gets 8000 kr. What was the total?"

Create heist scenarios:
- "Shadows raided 3 banks: 15,000 kr, 23,000 kr, and 12,000 kr. What's the total stolen amount?"
- "They stole 60,000 euros and split it equally among 4 members. How much does each receive?"
- "After stealing from Oslo bank, they spent 30% on equipment. They have 28,000 kr left. How much did they steal originally?"

        Use European currencies (kr, euros, złoty), banks in named cities.
        Make them feel like forensic accountants!
        Ask for numerical answers with currency if needed. End with "▋"`
    },
    {
        title: 'Binary Decoder',
        description: 'Shadow agents have encrypted critical data in binary. Decode it to unlock the system!',
        icon: <BinaryIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Shadow agents have encrypted a critical access code in binary format. The agent must decode binary to decimal or decode binary-encoded ASCII to retrieve the information.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Binary (base-2 number system)

SPECIFIC INSTRUCTIONS:
1. Use binary representation to encode/decode numbers or ASCII characters
2. Start at intermediate difficulty (they're advanced students): Binary-to-decimal or simple binary ASCII decoding
3. Provide checkpoints for intermediate steps: "If correct, your answer will be a two-digit number" or "The sum should be between 100-200"
4. Accept answers in format: single number, or "number1, number2" for multi-part answers

SELF-VERIFICATION:
- If answer is correct: Validate immediately with checkpoints like "Checkpoint passed: Your number has 3 digits ✓"
- If answer is wrong: Provide checkpoint hint like "Your current calculation suggests an error. The answer should be between 50-100."
- Prevent long error chains by validating early steps

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily decodes binary: Increase to multi-step binary calculations, ASCII binary decoding, or binary operations
- If user struggles: Simplify to basic binary-to-decimal, provide binary reference table, or give step-by-step conversion hints
- Start intermediate: Not "convert 1010" but "decode binary ASCII: 01001000..."

EXAMPLE SCENARIO BEGINNER (if struggling):
"The Shadows locked the Oslo server. The code in binary is: 1010. What is it in decimal?"
Checkpoint: "If correct, your answer will be between 5 and 15"

EXAMPLE SCENARIO INTERMEDIATE (default start):
"Shadow message intercepted: 01001000 01100101. Each 8-bit group represents an ASCII character. Decode both characters, then sum their ASCII decimal values. What is the total?"
Checkpoint: "The sum should be between 200-250"

EXAMPLE SCENARIO ADVANCED (if performing well):
"Critical binary cipher detected: (10110 × 1100) + 1011. Calculate in binary arithmetic, then convert final result to decimal. What is the answer?"
Checkpoint: "The result will be a three-digit number"

Remember: Make them feel "extra smart" for using specialized mathematical knowledge!
Use European contexts (Oslo, Warsaw, Kyiv servers/infrastructure).
End with "▋"`
    },
    {
        title: 'ASCII Cipher',
        description: 'The Shadows encrypted coordinates using ASCII values. Decode to find their location!',
        icon: <CipherIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: The Shadows have encrypted critical information using ASCII numerical representations. The agent must decode ASCII values to letters or use ASCII encoding in mathematical operations.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: ASCII (American Standard Code for Information Interchange)

SPECIFIC INSTRUCTIONS:
1. Use ASCII numerical values (A=65, B=66, etc.) to encode/decode information
2. Start at intermediate difficulty: ASCII decode to letters, or ASCII values with calculations
3. Provide checkpoints: "The word has 5 letters" or "The sum should be between 300-400"
4. Accept answers in format: word (for letter decode), number (for calculations), or "word, number" for combined

SELF-VERIFICATION:
- If answer is correct: Validate with checkpoints like "Checkpoint passed: The word has 5 letters ✓"
- If answer is wrong: Provide hint like "Your decoded word is too short. Check your ASCII conversions."
- Prevent long error chains by validating intermediate steps

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily decodes ASCII: Increase to multi-step puzzles, ASCII encoding (reverse), or complex ASCII math
- If user struggles: Simplify to single ASCII decode, provide ASCII reference (A=65, B=66...), or decode step-by-step
- Start intermediate: "Decode ASCII: 65-83-67-73-73" with calculation

EXAMPLE SCENARIO BEGINNER (if struggling):
"The coordinates are encoded as ASCII: 65, 83, 67, 73, 73. What word do these spell? (Convert each number to its letter)"
Checkpoint: "The word has 5 letters"

EXAMPLE SCENARIO INTERMEDIATE (default start):
"Shadow location code: 72-69-76-80. Decode each ASCII value to its letter, then calculate the sum of all ASCII values. What is the total?"
Checkpoint: "The sum should be between 280-320"

EXAMPLE SCENARIO ADVANCED (if performing well):
"Three Shadow agents have codes: Alpha=72, Beta=69, Gamma=76. Decode their names, then find the sum of their ASCII values. Divide by 3 and round. What is the result?"
Checkpoint: "The result will be a whole number between 70-75"

Use European contexts (Warsaw archives, Oslo servers, Kyiv coordinates).
Make them feel accomplished for using technical knowledge!
End with "▋"`
    },
    {
        title: 'Roman Riddle',
        description: 'Ancient Roman cipher discovered! Decode Roman numerals to reveal the Shadow\'s target.',
        icon: <RomanIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Ancient Roman cipher discovered in European archives. The Shadows have hidden critical numbers using Roman numerals that must be decoded and used in calculations.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Roman Numerals (I, V, X, L, C, D, M)

SPECIFIC INSTRUCTIONS:
1. Use Roman numerals (I=1, V=5, X=10, L=50, C=100, D=500, M=1000) to encode/decode numbers
2. Start at intermediate difficulty: Roman-to-decimal conversion with calculation
3. Provide checkpoints: "The year is between 1700-1800" or "The sum is a three-digit number"
4. Accept answers in format: single number, or "number1, number2" for multi-part

SELF-VERIFICATION:
- If answer is correct: Validate with checkpoints like "Checkpoint passed: Your number is in the correct range ✓"
- If answer is wrong: Provide hint like "Your conversion suggests an error. Remember: IV=4, IX=9, XL=40, XC=90..."
- Prevent long error chains by validating conversion accuracy early

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily converts Roman: Increase to complex Roman operations, multi-step Roman math, or historical date calculations
- If user struggles: Simplify to basic conversion, provide Roman reference table, or decode digit-by-digit
- Start intermediate: Not "convert V" but "MDCCLXXVI + C. What is the result in decimal?"

EXAMPLE SCENARIO BEGINNER (if struggling):
"The year in Roman numerals: MDCCLXXVI. Convert to decimal. What year is it?"
Checkpoint: "The year is between 1700-1800"

EXAMPLE SCENARIO INTERMEDIATE (default start):
"Shadow coordinates hidden in Roman: CL + LXXV. Convert each Roman numeral to decimal, then add them. What is the sum?"
Checkpoint: "The sum is a three-digit number"

EXAMPLE SCENARIO ADVANCED (if performing well):
"The Shadow base code: (MCDXLIV / II) + C. Calculate using Roman numeral math, then convert final result to decimal. What is the answer?"
Checkpoint: "The result is between 800-900"

Use European contexts (Warsaw archives, Berlin museums, ancient Roman sites in Europe).
Make them feel smart for using classical mathematical knowledge!
End with "▋"`
    },
    {
        title: 'Multi-Chain Breaker',
        description: 'Unlock the Shadow base by solving parallel puzzle chains simultaneously!',
        icon: <ChainIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Ultimate Shadow encryption using multiple independent puzzle chains. The agent must solve 3 parallel chains that combine into a final lock combination. Each chain can be solved independently and in any order.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Multi-chain (Binary, ASCII, Roman numerals combined)

SPECIFIC INSTRUCTIONS:
1. Present ALL 3 puzzle chains simultaneously at the start
2. Each chain is independent - can be solved without solving others first
3. Final solution combines all chain results into a lock combination format (digit1-digit2-digit3)
4. Provide checkpoints after each chain: "Digit 1 should be between 5-15"
5. Accept final answer in format: "digit1-digit2-digit3" or "digit1, digit2, digit3"

SELF-VERIFICATION:
- After each chain: Validate intermediate result with checkpoint
- Final answer: Validate combination format and range
- If wrong: Identify which chain has the error and provide targeted hint

ADAPTIVE BEHAVIOR:
- Analyze which chains user solves easily vs struggles with
- Adjust complexity of individual chains based on performance
- Provide hints for specific chains without revealing others
- Start with moderate complexity across all chains

EXAMPLE SCENARIO:
Present all 3 chains at once:

"CRITICAL: Unlock the Shadow base requires solving 3 parallel encryption chains. Work on them in any order.

CHAIN ALPHA (Binary):
The first digit is encoded in binary: 01001. Convert to decimal. This becomes digit 1 of the combination.
Checkpoint: Digit 1 should be between 5-15

CHAIN BETA (ASCII):
The second digit is encoded in ASCII: 53. Convert this ASCII value to its decimal number (not the letter it represents). This becomes digit 2.
Checkpoint: Digit 2 should be a single digit (0-9)

CHAIN GAMMA (Roman):
The third digit is encoded in Roman numerals: VII. Convert to decimal. This becomes digit 3.
Checkpoint: Digit 3 should be between 1-10

FINAL COMBINATION:
Once you have all three digits, combine them in order: digit1-digit2-digit3
Enter the full combination to unlock the base."

Use European locations (Shadow bases in Rogaland, Warsaw underground, Kyiv networks).
Make them feel accomplished for parallel problem-solving!
End with "▋"`
    },
    {
        title: 'Code Breaker Hub',
        description: 'Ultimate Shadow encryption combining multiple code systems in sequence!',
        icon: <CodeBreakerIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Ultimate Shadow master encryption system using multiple code systems in sequence. This is the most advanced challenge, combining Binary, ASCII, and Roman numerals in a multi-step process.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Combined (Binary → ASCII → Roman → Final Calculation)

SPECIFIC INSTRUCTIONS:
1. Create a multi-step puzzle requiring sequential application of different code systems
2. Provide checkpoints at EACH step to prevent long error chains
3. Break into clear, numbered steps (Step 1, Step 2, etc.)
4. Accept final answer as: single number or specified format
5. This is the hardest challenge - only increase difficulty if user excels at individual code systems

SELF-VERIFICATION:
- After each step: Provide validation checkpoint
- If step fails: Immediately provide targeted hint for that step
- Prevent proceeding with incorrect intermediate results

ADAPTIVE BEHAVIOR:
- Start with moderate complexity (3-4 steps)
- If user struggles: Reduce steps, simplify each step, or provide conversion tables
- If user excels: Add more steps, increase complexity of individual operations, or combine more code systems

EXAMPLE SCENARIO MODERATE (default):
"CRITICAL SYSTEM ACCESS REQUIRED.

The Shadows have encrypted the master access code using multiple systems. Solve step-by-step:

Step 1: Binary code detected: 01101000 01100101. Decode each 8-bit group to decimal.
Checkpoint: You should have two decimal numbers

Step 2: Convert those decimals to ASCII letters. What word do they spell?
Checkpoint: The word has two letters

Step 3: Take the ASCII sum of those two letters (add their ASCII decimal values). What is the sum?
Checkpoint: The ASCII sum should be between 200-250

Step 4: Convert that sum to Roman numerals.
Checkpoint: The Roman numeral should contain 3-6 characters

Step 5: Count the total number of characters in the Roman numeral (I, V, X, L, C, D, M count as one each).
Checkpoint: Final answer is a single digit

Your final answer is the character count from Step 5. Enter it now."

EXAMPLE SCENARIO ADVANCED (if performing well):
"ULTIMATE ENCRYPTION BREACH ATTEMPT.

Step 1: Binary: 01000001 01010011 01000011. Decode to decimals, then to ASCII letters.
Step 2: Sum the ASCII values of those letters.
Step 3: Convert sum to Roman numerals.
Step 4: Count Roman characters, then multiply by 2.
Step 5: Convert result back to binary.
Step 6: Count the number of 1s in that binary.
Final answer: Enter the count from Step 6."

Use dramatic European scenarios (Shadow master control systems, encrypted archives, critical infrastructure).
Make them feel like elite code-breakers!
End with "▋"`
    },
    {
        title: 'Morse Code Intercept',
        description: 'Intercepted Shadow transmission in Morse code! Decode the dots and dashes to reveal their plan!',
        icon: <MorseIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Shadow agents are transmitting encrypted messages using Morse code. The agent must decode dots (.) and dashes (-) to reveal critical intelligence or access codes.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Morse Code (International Morse Code)

SPECIFIC INSTRUCTIONS:
1. Use Morse code representation with dots (.) and dashes (-)
2. Start at intermediate difficulty: Single words or short phrases in Morse code
3. Provide checkpoints: "The decoded word has 5 letters" or "The message contains a number"
4. Accept answers in format: word/phrase (decoded text), or number if Morse represents digits
5. Morse code can be presented as: ".. ... / ... --- ..." or as flashing pattern description

SELF-VERIFICATION:
- If answer is correct: Validate with checkpoints like "Checkpoint passed: Your decoded word is correct ✓"
- If answer is wrong: Provide hint like "Your decoding suggests an error. Remember: Common letters use fewer symbols (E=., T=-)"
- Provide Morse reference if user struggles

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily decodes Morse: Increase to longer phrases, encoded numbers, or Morse-to-ASCII conversion
- If user struggles: Simplify to single letters, provide Morse code reference table, or decode step-by-step
- Start intermediate: "Decode this Morse: - .... . / -.-. --- -.. ."

EXAMPLE SCENARIO BEGINNER (if struggling):
"The intercepted signal: - .... . 
Decode this single letter. What letter is it?"
Checkpoint: "This is a common letter"

EXAMPLE SCENARIO INTERMEDIATE (default start):
"Shadow transmission intercepted: - .... . / ... .... .- -.. --- .-- ... / .- .-. . / -.-. --- -- .. -. --.
Decode the full message. What does it say?"
Checkpoint: "The message has 3 words, starting with 'THE'"

EXAMPLE SCENARIO ADVANCED (if performing well):
"Morse-encoded access code: .---- .---- .---- / .---- ----- .---- .----
Decode both numbers, then calculate their sum. What is the total?"
Checkpoint: "The sum should be a three-digit number"

MORSE CODE REFERENCE (provide if needed):
A=.-  B=-...  C=-.-.  D=-..  E=.  F=..-.  G=--.  H=....  I=..  J=.---
K=-.-  L=.-..  M=--  N=-.  O=---  P=.--.  Q=--.-  R=.-.  S=...  T=-
U=..-  V=...-  W=.--  X=-..-  Y=-.--  Z=--..
0=-----  1=.----  2=..---  3=...--  4=....-  5=.....  6=-....  7=--...  8=---..  9=----.
Space=/

Use European contexts (intercepted transmissions in Oslo, Warsaw signal intelligence, Kyiv communications).
Make them feel like elite intelligence operatives!
End with "▋"`
    },
    {
        title: 'Password Cracker',
        description: 'Shadow systems are password-protected! Crack the encryption to gain access!',
        icon: <PasswordIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: The Shadows have password-protected critical systems. The agent must crack passwords using clues, patterns, code conversion, or mathematical relationships to gain access.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Password Cracking (combines multiple code systems with logic)

SPECIFIC INSTRUCTIONS:
1. Create password-protected scenarios where the password is hidden in clues
2. Use various methods: Code conversion (Binary/ASCII/Roman → password), pattern analysis, mathematical relationships, or wordplay
3. Start at intermediate difficulty: Password requires 2-3 step decryption or pattern recognition
4. Provide checkpoints: "The password has 6 characters" or "The password starts with a capital letter"
5. Accept answers in format: password (as text string), or numeric code if password is all numbers

SELF-VERIFICATION:
- If answer is correct: Validate immediately: "Access granted! Password accepted ✓"
- If answer is wrong: Provide hint like "Access denied. Hint: The password contains 2 numbers and 4 letters"
- Prevent brute-force attempts by providing progressive hints after failures

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily cracks passwords: Increase complexity (longer passwords, multiple code systems, reverse logic)
- If user struggles: Simplify (shorter passwords, provide conversion tables, give pattern hints)
- Start intermediate: Password requiring ASCII decode or simple pattern

EXAMPLE SCENARIO BEGINNER (if struggling):
"The Shadow server password is encoded in ASCII: 65, 83, 67, 73, 73, 49, 49, 49
Convert to letters/numbers. What is the password?"
Checkpoint: "The password has 8 characters, ending with numbers"

EXAMPLE SCENARIO INTERMEDIATE (default start):
"Locked Shadow database found in Warsaw archives. Password clues:
- First part: Binary 01000001 = ?
- Second part: Sum of ASCII for 'CODE' = ?
- Third part: Roman numeral MDCLXVI - 100 = ?
Combine all parts to form the password (no spaces). What is it?"
Checkpoint: "The password is alphanumeric, 12 characters long"

PC/SOFTWARE SCENARIOS (incorporate these types):
- Locked Documents: "Shadow agent left a password-protected Word document. Password hint: ASCII 83-72-65-68-79-87"
- Guest Accounts: "Access the Shadow guest account on the Oslo server. Login password is encoded in binary: 01000001 01000011 01000011 01000101 01010011 01010011"
- Email Clues: "Intercepted email account requires password. The password is the sum of ASCII values for 'SHADOW' converted to Roman numerals"
- Website Access: "Hidden Shadow website URL contains encoded password. Decode: Binary 01000001 + ASCII sum of 'SECRET' + Roman MDCLXVI"
- Autocorrect Trick: "Type the word 'LOCK' in the document - autocorrect reveals the password hint encoded in ASCII"

EXAMPLE SCENARIO ADVANCED (if performing well):
"Multi-layer encryption detected in Kyiv control system. Crack the master password:
Layer 1: Morse code '-- --- .-. ... .' = ?
Layer 2: Convert that word to ASCII values, sum them
Layer 3: Convert sum to Roman numerals
Layer 4: Take first 3 characters of Roman, convert to ASCII
Final password: Convert those 3 ASCII values back to letters
What is the complete password?"
Checkpoint: "Final password has 3 letters, all uppercase"

Use dramatic scenarios (password-protected servers, encrypted databases, locked control systems).
Create urgency: "Security will reset the password in 5 minutes!"
Make them feel like elite hackers cracking secure systems!
End with "▋"`
    },
    {
        title: 'Intelligence Gathering',
        description: 'Infiltrate the Shadow network! Gather intelligence through multi-step espionage missions!',
        icon: <SpyIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Intelligence gathering mission - the agent must infiltrate Shadow facilities, gather evidence, and solve interconnected puzzles to uncover the Shadow's plans. This uses narrative-driven multi-step scenarios combining sabotage/repair, evidence gathering, and mastermind identification themes.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Intelligence Gathering (multi-step narrative with various code systems)

SPECIFIC INSTRUCTIONS:
1. Create compelling narratives: Sabotage & Repair, Intelligence Gathering, or Mastermind & Virus scenarios
2. Use multiple interconnected steps that tell a story
3. Each step requires solving a puzzle using different code systems (Binary, ASCII, Roman, Morse, etc.)
4. Start at intermediate difficulty: 3-4 step narrative with clear progression
5. Provide checkpoints after each major step: "Evidence collected: 2 of 4 pieces found"
6. Accept answers in format: varies by step (numbers, words, codes, coordinates)

NARRATIVE THEMES:
- Sabotage & Repair: "Shadows sabotaged the system. Find what they broke and fix it using [code system]"
- Intelligence Gathering: "You've infiltrated the hideout. Find evidence of their crimes before security arrives. Evidence 1: [puzzle]"
- Mastermind & Virus: "A criminal mastermind created a virus. Figure out who they are and where they're headed. Clue 1: [puzzle]"

SELF-VERIFICATION:
- After each step: "Step 1 complete: [Summary of what was discovered]"
- Final step: "Intelligence mission complete. You've uncovered: [Summary]"
- If step fails: Provide narrative-appropriate hint without breaking immersion

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily solves steps: Increase to 5-6 steps, add reverse puzzles (encode instead of decode), combine more code systems
- If user struggles: Reduce to 2-3 steps, simplify code systems, provide more explicit hints
- Start intermediate: 3-4 step narrative mission

EXAMPLE SCENARIO: SABOTAGE & REPAIR
"EMERGENCY: Shadows have sabotaged the Oslo power grid control system! You must fix it before the city loses power.

Step 1 - Diagnose the damage:
The error code is in binary: 01000101 01010010 01010010 01001111 01010010
Decode to find what system was damaged.
Checkpoint: You should get a 5-letter word

Step 2 - Find the repair code:
The repair sequence is hidden in ASCII: 82, 69, 80, 65, 73, 82
Decode to get the repair command.
Checkpoint: This is a 6-letter command word

Step 3 - Calculate the reset value:
The reset requires a calculation. Take the ASCII sum of the repair command, divide by 10, round down.
What is the reset value?
Checkpoint: The value is between 40-50

Step 4 - Final confirmation:
Enter the reset value to restore the system!"

EXAMPLE SCENARIO: INTELLIGENCE GATHERING
"INTEL MISSION: You've infiltrated Shadow headquarters in Warsaw. Gather evidence before security arrives in 10 minutes!

Evidence 1 - Financial records:
Found encrypted ledger. Decode using Roman numerals: MMDCCLXXX
Convert to get the amount stolen (in thousands).
Checkpoint: Amount is between 2000-3000

Evidence 2 - Location coordinates:
Intercepted Morse transmission: -. --- .-. - .... / .---- .----
Decode to find their next target location and coordinates.
Checkpoint: Location has 5 letters, coordinates are two-digit

Evidence 3 - Master password fragment:
Binary code found: 01010000 01000001 01010011 01010011
Convert to ASCII to get part of the master password.
Checkpoint: Fragment is 4 letters

MISSION COMPLETE: Combine all evidence to reveal Shadow plan!"

Use high-stakes, time-sensitive scenarios (bomb defusal, security arrival countdown, system failure deadline).
Make them feel like elite secret agents on critical missions!
Create narrative tension and urgency!
End with "▋"`
    },
    {
        title: 'Digital Forensics',
        description: 'Analyze Shadow digital evidence! Extract clues from locked files, emails, and hidden data!',
        icon: <ForensicsIcon />,
        prompt: `ADVANCED CODE-BREAKING MISSION INITIATED!

CONTEXT: Digital forensics mission - the agent must analyze Shadow digital evidence including locked files, intercepted emails, hidden documents, and encoded data. This simulates PC/software-based puzzles in a text-based terminal environment.

TARGET AUDIENCE: Advanced (16-year-old mathematics students with specialized knowledge)
CODE SYSTEM: Digital Forensics (combines PC concepts with multiple code systems)

SPECIFIC INSTRUCTIONS:
1. Create scenarios simulating locked files, password-protected documents, email accounts, hidden websites, or digital evidence
2. Use various code systems (Binary, ASCII, Roman, Morse) to encode passwords, file names, or hidden data
3. Present as: "Found locked [file type]. Password is encoded in [code system]..."
4. Start at intermediate difficulty: 2-3 step process to extract information
5. Provide checkpoints: "The file password has 6 characters" or "The email contains a number encoded in Roman"
6. Accept answers in format: password, decoded text, extracted number, or file name

PC/SOFTWARE PUZZLE TYPES TO SIMULATE:
- Password-Protected Documents: "Locked Word document found. Password hint: Binary 01000001..."
- Locked Email Accounts: "Intercepted email account requires login. Password is ASCII sum of 'SHADOW'..."
- Hidden Websites: "QR code leads to encrypted website. Access code: Roman MDCLXVI converted to ASCII..."
- File System Forensics: "Shadow agent's file system has password-protected folders. Decode folder names from Binary..."
- Autocorrect Clues: "Type 'LOCK' in the document - autocorrect reveals 'SHADOW' encoded in ASCII 83-72-65-68-79-87"
- Digital Evidence: "Found encrypted USB drive contents. Password requires: Binary decode + ASCII conversion + Roman sum"

SELF-VERIFICATION:
- If answer is correct: "File unlocked! Access granted ✓" or "Email decrypted! Found: [discovered information]"
- If answer is wrong: Provide hint like "Access denied. Hint: The password contains letters only"
- Prevent frustration by validating intermediate steps

ADAPTIVE BEHAVIOR:
- Analyze conversation history for skill level
- If user easily extracts data: Increase to multi-file analysis, reverse encoding (encode instead of decode), or complex data extraction chains
- If user struggles: Simplify to single file, provide code reference tables, or give step-by-step extraction hints
- Start intermediate: "Found locked document. Password encoded in ASCII..."

EXAMPLE SCENARIO BEGINNER (if struggling):
"Forensics report: Found password-protected Word document on Shadow agent's computer.
Password hint: Binary 01000001 01000011 01000011 01000101 01010011 01010011
Decode to get the password. What is it?"
Checkpoint: "The password is 7 letters, all uppercase"

EXAMPLE SCENARIO INTERMEDIATE (default start):
"Digital evidence found in Oslo server raid:
Evidence 1 - Locked Email Account:
Login password is encoded: ASCII sum of 'SHADOW' + Roman MDCLXVI value
Calculate to get the password.

Evidence 2 - Password-Protected Excel File:
File password: Binary 01001000 01001001 01000100 01000100 01000101 01001110
Decode to unlock the financial records.

Evidence 3 - Hidden Website Access:
QR code decryption reveals website password requires:
- First part: Morse code '-- --- .-. ... .' decoded to ASCII
- Second part: Sum those ASCII values
Enter the website password (combined result)."
Checkpoint: "Website password is a number between 500-600"

EXAMPLE SCENARIO ADVANCED (if performing well):
"Complex forensics analysis required in Warsaw investigation:

Step 1 - Email Account Access:
Found locked Shadow email account. Password is:
(ASCII sum of 'EMAIL') + (Binary 1010 converted to decimal) + (Roman CL converted to decimal)
Calculate the total password.

Step 2 - Document Collection:
Access the email to find 3 password-protected documents.
Document 1 password: Take Step 1 result, convert to binary, count the 1s
Document 2 password: Take Step 1 result, convert to Roman, count characters
Document 3 password: Take Step 1 result, convert to Morse, count dots
Enter the three passwords separated by commas: password1, password2, password3

Step 3 - Data Extraction:
Documents reveal encoded coordinates:
X coordinate: ASCII 78, 79, 82, 84, 72 (decode and sum ASCII values)
Y coordinate: Binary 01110010 01101111 01100111 (decode and sum binary values)
Enter coordinates as: (x, y)"
Checkpoint: "Coordinates are between (400-500, 2500-2600)"

Use realistic PC/software scenarios (Word documents, Excel files, email accounts, websites, file systems).
Create investigative narrative: "Analyze the digital evidence before it's deleted!"
Make them feel like elite digital forensics experts extracting hidden information!
End with "▋"`
    }
];

export const DECRYPTION_HUB_ITEM = {
    title: 'Decryption Hub',
    description: 'Access the shop to spend Data Bits on terminal upgrades.',
    icon: <LockIcon />,
    prompt: '' // Not a real challenge, so prompt is empty
};

export const VOICES: Voice[] = [
    { name: 'Default', description: 'Standard Zyber voice.', cost: 0 },
    { name: 'Glitched', description: 'A corrupted, unstable voice.', cost: 50 },
// Fix: Added missing colon after 'name' property key.
    { name: 'Oracle', description: 'A deeper, more mysterious voice.', cost: 75 },
];


export const DEFAULT_VOICE_SETTINGS: Omit<VoiceSettings, 'uiSoundsEnabled'> = {
    gender: 'male',
    language: 'en',
    vocoderEnabled: true,
    vocoderFrequency: 40,
    // Advanced voice effects (new synthetic voice system)
    useAdvancedEffects: true, // Enable by default for synthetic sound
    voicePreset: 'zyber', // Default Zyber preset
    customEffects: undefined, // Not using custom initially
};
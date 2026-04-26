/**
 * AI Tutor Web App - Phase-Based Q&A Engine
 * Phases: Analyze → Synthesize → Contextualize → Integrate → Harmonize
 * Evaluation: Keyword-based semantic similarity
 */

// ─── DOM Elements ─────────────────────────────────────────────────────────────
const elements = {
    chatMessages: document.getElementById('chat-messages'),
    userInput: document.getElementById('user-input'),
    hintBtn: document.getElementById('hint-btn'),
    sendBtn: document.getElementById('send-btn'),
    resetBtn: document.getElementById('reset-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    typingIndicator: document.getElementById('typing-indicator'),
    navItems: document.querySelectorAll('.phase-item'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    lbPasswordModal: document.getElementById('lb-password-modal'),
    closeLbPasswordBtn: document.getElementById('close-lb-password-btn'),
    lbPasswordInput: document.getElementById('lb-password-input'),
    lbPasswordError: document.getElementById('lb-password-error'),
    cancelLbPasswordBtn: document.getElementById('cancel-lb-password-btn'),
    confirmLbPasswordBtn: document.getElementById('confirm-lb-password-btn'),
    leaderboardModal: document.getElementById('leaderboard-modal'),
    closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
    leaderboardBody: document.getElementById('leaderboard-body')
};

// ─── State Machine ────────────────────────────────────────────────────────────
const STATE = {
    AWAITING_GREETING: 0,
    AWAITING_NAME: 1,
    PROJECT_SELECTION: 2,
    PHASE1: 3,
    PHASE2: 4,
    PHASE3: 5,
    PHASE4: 6,
    PHASE5: 7,
    CONCLUSION: 8,
    FOLLOW_UP: 9
};

// ─── Phase Definitions ────────────────────────────────────────────────────────
const PHASES = [
    {
        key: 'phase1',
        name: 'Phase 1: Analyze (Identify Domains)',
        goal: 'Help the student identify core and secondary disciplines involved in their project.',
        transition: '',
        interactions: [
            { text: "To tackle this problem, we first need to understand the knowledge required. What would you say is the primary field or core discipline at the heart of this issue?", hint: "Think about what kind of engineer or specialist would be most essential to solve this problem from scratch. What is the dominant technical area \u2014 is it mechanical, electrical, software, biological, or something else?" },
            { text: "Why did you select this domain as the primary one?", hint: "Ask them to justify their choice based on the core functionality of the project." },
            { text: "Every complex problem pulls from multiple areas of expertise, but not all carry equal weight. Besides the core discipline you just identified, what are two or three secondary fields that are absolutely essential to making a solution actually work in the real world?", hint: "Consider what else the solution needs beyond the core \u2014 does it need to communicate data? Be manufactured? Meet safety regulations? Interact with people? Each of those needs points to a supporting discipline." },
            { text: "Why did you select these secondary domains?", hint: "Ask them to explain how those secondary domains support the primary function." }
        ],
        summaryTemplate: `Thank you for exploring this. Here is a complete analysis of the domains required to fully understand this problem:\n\n\u2022 Core Technical Domain(s): [Name] \u2013 Role: [Why it's needed]\n\u2022 Supporting/Integrative Domain(s): [Name] \u2013 Role: [Why it's needed]\n\u2022 Contextual/Systemic Domain(s): [Name] \u2013 Role: [Why it's needed]`,
        navIdx: 1,
        nextState: STATE.PHASE2
    },
    {
        key: 'phase2',
        name: 'Phase 2: Synthesize (Extract Domain Knowledge)',
        goal: 'Identify specific building blocks \u2014 hardware, software, and theoretical concepts.',
        transition: 'We have successfully mapped out the domains. Now, we are moving to the next phase: identifying the specific building blocks within those domains.',
        interactions: [
            { text: "Looking at the fields we just discussed, what specific hardware components are essential to understand this problem?", hint: "Think about the physical parts of the solution \u2014 sensors, processors, actuators, power sources, structural components. What physical items must exist for the system to function?" },
            { text: "Why did you select this hardware?", hint: "Ask them to justify the physical components." },
            { text: "What specific software tools, algorithms, or theoretical concepts are essential to understand this problem?", hint: "Think about the invisible layer of the solution \u2014 what logic runs the hardware? What math or theory explains the behavior? Consider control systems, communication protocols, data processing, or design principles." },
            { text: "Why did you select this software or concept?", hint: "Ask them to justify the logical components." }
        ],
        summaryTemplate: `Thank you for narrowing that down. Here is a complete synthesis of the essential concepts:\n\n\u2022 Essential Components (Hardware/Software): [List] \u2013 Required because: [reason]\n\u2022 Essential Methods & Concepts: [List] \u2013 Required because: [reason]\n\u2022 System Boundaries (Excluded Elements): [List] \u2013 Excluded because: [reason]`,
        navIdx: 2,
        nextState: STATE.PHASE3
    },
    {
        key: 'phase3',
        name: 'Phase 3: Contextualize (Situate the Problem)',
        goal: 'Place the solution in a real-world setting and identify users, constraints, and environment.',
        transition: 'We have successfully isolated our essential components and methods. Now, we are moving to the next phase: situating this knowledge in the real world.',
        interactions: [
            { text: "In what specific real-world setting does this problem occur, or what are the primary applications of this problem?", hint: "Who is actually using this system and where? Is it deployed in a factory, a hospital, a home, outdoors? Think about the environment where someone would switch this on for the first time." },
            { text: "Why did you select this application?", hint: "Ask them to explain their reasoning for this setting." },
            { text: "What are the other applications of this problem beyond the primary one?", hint: "Think across industries \u2014 could the same technology be used in agriculture, defense, education, logistics, or healthcare? What other problems share a similar structure?" },
            { text: "Why did you select this application?", hint: "Ask for justification on these secondary applications." }
        ],
        summaryTemplate: `Thank you for giving a complete picture of the environment:\n\n\u2022 Real-World Setting & Application: [summary] \u2013 This dictates our operational environment.\n\u2022 End-User Profile: [summary] \u2013 This dictates usability and interface requirements.\n\u2022 Key Constraints: [summary] \u2013 This dictates what we cannot do.\n\u2022 Environmental Factors: [summary] \u2013 This dictates durability and compliance needs.`,
        navIdx: 3,
        nextState: STATE.PHASE4
    },
    {
        key: 'phase4',
        name: 'Phase 4: Integrate (Combine Components)',
        goal: 'Show how components from different domains connect into one unified system.',
        transition: 'We have mapped out our essential components and defined the real-world conditions they must survive in. Now, we are moving to the next phase: integrating these pieces into a unified solution.',
        interactions: [
            { text: "Looking at the key elements we extracted, how can the selected components from our different domains be initially combined?", hint: "Think about what connects to what. How does the hardware send information to the software? What is the handoff point between the mechanical part and the digital part? Start with a simple input-process-output flow." },
            { text: "Why did you select this integration approach or interface?", hint: "Ask them to justify the connection method." },
            { text: "What are the interfacing strategies required to combine the hardware and software components?", hint: "Consider communication protocols (UART, I2C, SPI, WiFi, Bluetooth), APIs, middleware, or data formats. What standard or protocol allows two different components to talk to each other reliably?" },
            { text: "Why did you select these interfaces?", hint: "Ask them for their rationale on these protocols." }
        ],
        summaryTemplate: `Thank you for designing those connections:\n\n\u2022 Integrated Workflow: [step-by-step flow] \u2013 Sequence of operations.\n\u2022 Component Interactions: [domain A \u2194 domain B] \u2013 Systemic relationships and data/energy flow.\n\u2022 Constraint Adaptations: [design modifications] \u2013 Ensures practical viability.\n\u2022 Problem Resolution: [how it solves the original problem] \u2013 Confirms core objective is met.`,
        navIdx: 4,
        nextState: STATE.PHASE5
    },
    {
        key: 'phase5',
        name: 'Phase 5: Harmonize (Balance and Trade-offs)',
        goal: 'Evaluate whether the system balances technical performance with real-world constraints.',
        transition: 'We have successfully integrated our components into a unified workflow. Now, we are moving to the final phase: evaluating and balancing this system.',
        interactions: [
            { text: "Looking critically at what we've designed, does the integrated solution appropriately balance ideal technical performance with the strict contextual constraints we defined earlier?", hint: "Think about whether the ideal version of your design is actually buildable under the constraints you identified \u2014 budget, environment, regulations. Where does perfect performance clash with practical limits? That clash is the trade-off." },
            { text: "Why do you find this balance crucial?", hint: "Ask them why this specific balance impacts the project's success." },
            { text: "Are there any other ways the integrated solution needs to balance technical performance with contextual constraints? What additional trade-offs did you notice?", hint: "Consider longevity, sustainability, and ethics \u2014 is the solution safe for all users? Is it repairable? Does it respect the environment? Sometimes a technically superior solution is ruled out for ethical or social reasons." },
            { text: "Why do you find this particular trade-off crucial to address?", hint: "Ask them for their ethical or long-term reasoning." }
        ],
        summaryTemplate: `Thank you for making those tough decisions:\n\n\u2022 Resolved Trade-offs: [key compromises] \u2013 What was sacrificed and what was gained.\n\u2022 Justifications for Priorities: [why choices were made] \u2013 Defends the logic of the design.\n\u2022 Sustainability & Ethics: [long-term viability] \u2013 Ensures responsible, feasible solution.\n\u2022 The Harmonized Solution: [final balanced approach] \u2013 Realistic, actionable, mature blueprint.`,
        navIdx: 5,
        nextState: STATE.CONCLUSION
    }
];

// ─── App State ────────────────────────────────────────────────────────────────
let currentState = STATE.AWAITING_GREETING;
let currentProject = '';
let userName = '';
let currentPhaseIdx = 0;   // index into PHASES array (0–4)
let currentSubStepIdx = 0; // index into phase.interactions (0-3)
let phaseHistory = [];     // user answers and model evals for the current phase
let globalHistory = [];    // store summaries across phases to feed to conclusion
let totalScore = 0;        // cumulative score across phases

// ─── Utilities ────────────────────────────────────────────────────────────────
const showTyping = () => {
    elements.typingIndicator.classList.remove('hidden');
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};
const hideTyping = () => elements.typingIndicator.classList.add('hidden');

const updateSidebarProgress = (phaseIndex) => {
    elements.navItems.forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index < phaseIndex) item.classList.add('completed');
        else if (index === phaseIndex) item.classList.add('active');
    });
};

const createMessageHTML = (text, isUser = false, feedbackObj = null) => {
    let html = `
        <div class="message ${isUser ? 'user-message' : 'tutor-message'}">
            <div class="avatar"><i class="${isUser ? 'fa-solid fa-user' : 'fa-solid fa-robot'}"></i></div>
            <div class="bubble">
    `;

    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    paragraphs.forEach(p => { html += `<p>${p}</p>`; });

    if (feedbackObj) {
        let tagClass, label;
        if (feedbackObj.status === 'correct') { tagClass = 'feedback-correct'; label = 'Correct ✓'; }
        else if (feedbackObj.status === 'partial') { tagClass = 'feedback-partial'; label = 'Partial — Hint'; }
        else { tagClass = 'feedback-wrong'; label = 'Guidance'; }

        html += `
            <div class="feedback-box ${tagClass}">
                <span class="feedback-tag">${label}</span>
                <p><em>${feedbackObj.hint}</em></p>
            </div>
        `;
    }

    html += `</div></div>`;
    return html;
};

const appendMessage = (text, isUser = false, feedbackObj = null) => {
    elements.chatMessages.insertAdjacentHTML('beforeend', createMessageHTML(text, isUser, feedbackObj));
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

// Semantic Similarity Engine removed in favor of direct Gemini integration

// ─── Core Processing ──────────────────────────────────────────────────────────
const processUserInput = async (input) => {
    if (!input.trim()) return;

    appendMessage(input, true);
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';

    showTyping();
    await handleStateTransition(input);
    hideTyping();
};

// ─── State Machine ────────────────────────────────────────────────────────────
const handleStateTransition = async (input) => {
    const lowerInput = input.toLowerCase().trim();

    switch (currentState) {

        case STATE.AWAITING_GREETING:
            if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
                currentState = STATE.AWAITING_NAME;
                appendMessage('Hello! I will be your facilitator for an interactive learning session today.\n\nBefore we begin, could you please tell me your name?');
            } else {
                appendMessage('Please type "Hi" in the chat box to begin the interactive learning session.');
            }
            break;

        case STATE.AWAITING_NAME:
            userName = input.replace(/my name is|i am|i'm/gi, '').trim();
            userName = userName.length > 0
                ? userName.charAt(0).toUpperCase() + userName.slice(1)
                : 'Student';
            currentState = STATE.PROJECT_SELECTION;
            appendMessage(`Nice to meet you, ${userName}!\n\nThis activity consists of 5 distinct phases where we will analyze an interdisciplinary engineering project using the ASCIH framework.\n\nTo begin, please present a specific engineering project you would like to analyze.`);
            break;

        case STATE.PROJECT_SELECTION:
            if (input.trim().length > 5) {
                currentProject = input.trim();
                currentState = STATE.PHASE1;
                currentPhaseIdx = 0;
                currentSubStepIdx = 0;
                phaseHistory = [];
                globalHistory = [];
                totalScore = 0;
                updateSidebarProgress(1);
                const p = PHASES[0];
                let msg = `Thank you, ${userName}. We will analyze the **${currentProject}**.\n\n**${p.name}**\n\n*Goal: ${p.goal}*\n\n`;
                if (p.transition) msg += `${p.transition}\n\n`;
                msg += `${p.interactions[0].text}`;
                appendMessage(msg);
            } else {
                appendMessage('Please provide a more descriptive engineering project to analyze.');
            }
            break;

        case STATE.PHASE1:
        case STATE.PHASE2:
        case STATE.PHASE3:
        case STATE.PHASE4:
        case STATE.PHASE5:
            await handlePhaseAnswer(input);
            break;

        case STATE.CONCLUSION:
            if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('ok')) {
                currentState = STATE.FOLLOW_UP;
                updateSidebarProgress(1);
                appendMessage('Excellent! Please provide the next engineering project you would like to analyze, or tell me your engineering domain and I can suggest one for you.');
            } else {
                appendMessage('Thank you for participating in this learning session. The activity is now concluded. The page will refresh automatically.');
                elements.userInput.disabled = true;
                elements.sendBtn.disabled = true;
                elements.hintBtn.disabled = true;
                setTimeout(() => location.reload(), 3000);
            }
            break;

        case STATE.FOLLOW_UP:
            currentProject = input.trim();
            currentState = STATE.PHASE1;
            currentPhaseIdx = 0;
            currentSubStepIdx = 0;
            phaseHistory = [];
            globalHistory = [];
            totalScore = 0;
            updateSidebarProgress(1);
            const p0 = PHASES[0];
            let msgFollow = `Understood. We will now apply the ASCIH framework to the **${currentProject}**.\n\n**${p0.name}**\n\n*Goal: ${p0.goal}*\n\n`;
            if (p0.transition) msgFollow += `${p0.transition}\n\n`;
            msgFollow += `${p0.interactions[0].text}`;
            appendMessage(msgFollow);
            break;
    }
};

// ─── Gemini API Integration ───────────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyBWfWUll9RIJpvznBjgKBrNdP-N__El_xU';

const generateGeminiInteraction = async (phase, subStepIdx, historyCtx, userAnswer) => {
    const isFinalSummary = (subStepIdx === phase.interactions.length - 1);
    const interaction = phase.interactions[subStepIdx];
    
    let systemInstruction = "";
    if (!isFinalSummary) {
        systemInstruction = `Role: Facilitator for an interactive learning session using the Socratic method. (Do NOT introduce yourself).
Project: "${currentProject}"
Current Phase: ${phase.name}
We are currently evaluating the user's answer to this specific question: "${interaction.text}"
User's Answer: "${userAnswer}"
Previous Phase Context: ${JSON.stringify(historyCtx)}

Behavioral Rules:
1. If the user asks a question, provide an appropriate answer.
2. If the user explicitly says they don't know, YOU MUST explicitly define and provide the exact technical answer they should have given relating to the "${currentProject}". Do NOT ask them to guess, and Do NOT give a hint. State the answer clearly.
3. Otherwise, give an acknowledgement \u2192 confirm what is correct \u2192 correct any wrong parts with explanation \u2192 provide the actual ideal perspective before moving to the next question.
4. Keep it brief (2-4 sentences max).
5. DO NOT ask the next question! The UI will automatically append the next question.

Respond IN PURE JSON with these fields:
{"evaluation": "<your thoughtful evaluation and response>", "status": "<'correct', 'partial', or 'wrong'>", "score": <0-100 score of their answer>}`;
    } else {
        systemInstruction = `You are a facilitator finalizing Phase: ${phase.name} on the project: "${currentProject}".
The user just answered the final interaction question: "${interaction.text}"
User's final answer: "${userAnswer}"
Entire Phase Chat Context: ${JSON.stringify(historyCtx)}

Task:
1. Provide a brief 1-2 sentence evaluation/acknowledgement of their final answer. 
2. Generate the FINAL Phase Summary EXACTLY following the template below. Replace the bracketed placeholders [like this] with information synthesized from the user's answers and your expert knowledge. Keep the exact text strings surrounding the brackets.

TEMPLATE TO FILL OUT:
${phase.summaryTemplate}

Respond IN PURE JSON with these fields:
{"evaluation": "<brief evaluation of their final answer>", "summary": "<the fully populated summary string, respecting formatting and line breaks>", "score": <0-100 score>}`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Answer to evaluate: "${userAnswer}"` }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const rawText = data.candidates[0].content.parts[0].text;
            const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        }
    } catch (e) {
        console.error('Gemini error:', e);
    }
    
    // Fallback if API fails
    return {
        evaluation: "I understood your response.",
        summary: !isFinalSummary ? null : phase.summaryTemplate,
        score: 50
    };
};

const generateSessionConclusionWithGemini = async () => {
    const systemInstruction = `You are wrapping up an interactive learning session about the project: "${currentProject}".
Here is a summary of all 5 phases discussed:
${JSON.stringify(globalHistory)}

Task:
1. Define the ASCIH Framework briefly:
- A - Analyze: Breaking the project down into its core parts and disciplines.
- S - Synthesize: Extract the core parts from different domains or disciplines.
- C - Contextualize: Looking at the project within the real world or a broader environment.
- I - Integrate: Checking how well the different disciplines blend together.
- Harmonize: Ensuring the final project outcome is smooth, unified, and solves the target problem.
2. Explain the Application: Write a cohesive paragraph explaining how you applied each of these 5 steps to their specific project, ending with a consolidated final evaluation of their project.

Respond IN PURE JSON with these fields:
{"conclusion": "<the formatted markdown text containing the definitions and the application to their project>"}
`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Generate conclusion.` }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const rawText = data.candidates[0].content.parts[0].text;
            const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText).conclusion;
        }
    } catch (e) {
        console.error('Gemini error:', e);
    }
    return "Session Concluded. You have successfully navigated the ASCIH framework.";
}

// ─── Phase Answer Handler ─────────────────────────────────────────────────────
const handlePhaseAnswer = async (input) => {
    const phase = PHASES[currentPhaseIdx];
    
    // Store user response in context
    phaseHistory.push({ role: 'user', interactionIdx: currentSubStepIdx, text: input });

    // Dynamic Gemini Evaluation for the specific sub-step
    const evalData = await generateGeminiInteraction(phase, currentSubStepIdx, phaseHistory, input);
    
    totalScore += evalData.score || 0;
    phaseHistory.push({ role: 'model', text: evalData.evaluation });

    if (currentSubStepIdx < phase.interactions.length - 1) {
        // Output evaluation, then ask next sub-step question
        const responseText = `${evalData.evaluation}\n\n${phase.interactions[currentSubStepIdx + 1].text}`;
        const feedbackObj = { 
            status: evalData.status || "correct", 
            hint: evalData.status === 'correct' ? "Good job!" : "Review Feedback" 
        };
        appendMessage(responseText, false, feedbackObj);
        currentSubStepIdx++;
    } else {
        // Final interaction for this phase. Output evaluation + Summary
        const responseText = `${evalData.evaluation}\n\n**Phase Summary**\n\n${evalData.summary}\n\nWe are now moving to the next phase.`;
        appendMessage(responseText, false, { status: "correct", hint: "Phase Complete" });
        
        globalHistory.push({ phaseName: phase.name, phaseSummary: evalData.summary });
        
        // Progress to next Phase
        advancePhase();
    }
};

// ─── Phase Advancement ────────────────────────────────────────────────────────
const advancePhase = async () => {
    currentPhaseIdx++;
    currentSubStepIdx = 0;
    phaseHistory = [];

    // Check if we exhausted all phases
    if (currentPhaseIdx < PHASES.length) {
        const nextPhase = PHASES[currentPhaseIdx];
        currentState = nextPhase.key === 'phase2' ? STATE.PHASE2 : 
                       nextPhase.key === 'phase3' ? STATE.PHASE3 : 
                       nextPhase.key === 'phase4' ? STATE.PHASE4 : STATE.PHASE5;
                       
        updateSidebarProgress(nextPhase.navIdx);
        setTimeout(() => {
            let nextMsg = `**${nextPhase.name}**\n\n*Goal: ${nextPhase.goal}*\n\n`;
            if (nextPhase.transition) nextMsg += `${nextPhase.transition}\n\n`;
            nextMsg += `${nextPhase.interactions[0].text}`;
            appendMessage(nextMsg);
        }, 800);
    } else {
        // Run Conclusion Logic
        currentState = STATE.CONCLUSION;
        updateSidebarProgress(6); 
        
        // Show typing, fetch conclusion
        showTyping();
        const conclusionText = await generateSessionConclusionWithGemini();
        hideTyping();
        
        let finalMessage = `**Session Conclusion**\n\n${conclusionText}\n\nAre you interested in continuing the interaction with another example project?`;
        appendMessage(finalMessage, false);

        // Submit Score silently
        const finalScore = Math.round(totalScore / 20); // 20 updates across 5 phases (4 max per phase)
        fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_name: userName, score: finalScore })
        }).catch(e => console.error("Error submitting score:", e));
    }
};

// ─── Hint Button ──────────────────────────────────────────────────────────────
elements.hintBtn.addEventListener('click', () => {
    const isInPhase = currentState >= STATE.PHASE1 && currentState <= STATE.PHASE5;
    if (isInPhase) {
        const phase = PHASES[currentPhaseIdx];
        if (currentSubStepIdx < phase.interactions.length) {
            const currentHint = phase.interactions[currentSubStepIdx].hint;
            appendMessage(currentHint, false, { status: 'partial', hint: 'Guidance Provided' });
        }
    }
});

// ─── Event Listeners ──────────────────────────────────────────────────────────
elements.sendBtn.addEventListener('click', () => processUserInput(elements.userInput.value));

elements.userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        processUserInput(elements.userInput.value);
    }
});

elements.userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
    if (this.value === '') this.style.height = 'auto';
});

elements.resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the session?')) location.reload();
});

if (elements.mobileMenuBtn) {
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.sidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('open');
    });
}

if (elements.sidebarOverlay) {
    elements.sidebarOverlay.addEventListener('click', () => {
        elements.sidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('open');
    });
}

// ─── Full Screen Option ────────────────────────────────────────────────────────
if (elements.fullscreenBtn) {
    elements.fullscreenBtn.addEventListener('click', () => {
        const icon = elements.fullscreenBtn.querySelector('i');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            if (icon) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            if (icon) {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
        }
    });
}

elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('open');
            elements.sidebarOverlay.classList.remove('open');
        }
    });
});

// ─── Leaderboard Flow ─────────────────────────────────────────────────────────

// Fetch Leaderboard Data
const fetchLeaderboard = async () => {
    if (!elements.leaderboardBody) return;
    elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Fetching rankings...</td></tr>';
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
            let html = '';
            data.leaderboard.forEach(student => {
                html += `
                    <tr>
                        <td>${student.rank}</td>
                        <td>${student.student_name}</td>
                        <td>${student.score}</td>
                        <td>
                            <button class="icon-btn" title="Edit" disabled><i class="fa-solid fa-pen"></i></button>
                        </td>
                    </tr>
                `;
            });
            elements.leaderboardBody.innerHTML = html;
        } else {
            elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No rankings available yet.</td></tr>';
        }
    } catch (e) {
        elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--error);">Error loading leaderboard.</td></tr>';
    }
};

// Leaderboard Modal Listeners
if (elements.leaderboardBtn && elements.lbPasswordModal) {
    elements.leaderboardBtn.addEventListener('click', () => {
        elements.lbPasswordError.style.display = 'none';
        elements.lbPasswordInput.value = '';
        elements.lbPasswordModal.classList.remove('hidden');
    });

    const closePasswordModal = () => {
        elements.lbPasswordModal.classList.add('hidden');
    };

    if (elements.closeLbPasswordBtn) elements.closeLbPasswordBtn.addEventListener('click', closePasswordModal);
    if (elements.cancelLbPasswordBtn) elements.cancelLbPasswordBtn.addEventListener('click', closePasswordModal);

    if (elements.confirmLbPasswordBtn) {
        elements.confirmLbPasswordBtn.addEventListener('click', () => {
            if (elements.lbPasswordInput.value === '113003') {
                elements.lbPasswordModal.classList.add('hidden');
                elements.leaderboardModal.classList.remove('hidden');
                fetchLeaderboard();
            } else {
                elements.lbPasswordError.style.display = 'block';
            }
        });
    }

    if (elements.closeLeaderboardBtn) {
        elements.closeLeaderboardBtn.addEventListener('click', () => {
            elements.leaderboardModal.classList.add('hidden');
        });
    }
}

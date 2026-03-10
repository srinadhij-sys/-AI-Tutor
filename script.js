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
// Each phase has: name, goal, question, keywords (for similarity), deepenProbe, summary, navIdx
const PHASES = [
    {
        key: 'phase1',
        name: 'Phase 1: Analyze (Identify Domains)',
        goal: 'Identify and examine the various domains of knowledge involved.',
        question: 'To tackle this problem, we first need to understand the knowledge required. What would you say is the primary field or core discipline at the heart of this issue?',
        keywords: ['mechanical', 'electrical', 'computer science', 'software', 'control theory', 'materials', 'mathematics', 'kinematics', 'linkage', 'structure', 'actuator', 'power', 'programming', 'engineering', 'logic', 'domain'],
        summary: `Thank you for exploring this. Here is a complete analysis of the domains required to fully understand this problem:\n\no Core Technical Domain(s): Mechanical and Electrical Engineering – Role: They provide the fundamental physical structure and actuation capabilities.\no Supporting/Integrative Domain(s): Computer Science – Role: Needed to program the logic that dictates movement.\no Contextual/Systemic Domain(s): Control Theory and Mathematics – Role: Crucial for calculating inverse kinematics and maintaining stability in motion.\n\n**We are now moving to the next phase.**`,
        navIdx: 1,
        nextState: STATE.PHASE2
    },
    {
        key: 'phase2',
        name: 'Phase 2: Synthesize (Extract Domain Knowledge)',
        goal: 'Extract essential components and methods from the identified domains.',
        question: 'We have successfully mapped out the domains. Now, we are moving to the next phase: identifying the specific building blocks within those domains. Looking at the fields we just discussed, what specific hardware, software, or theoretical concepts are essential to understand this problem?',
        keywords: ['servo', 'stepper', 'motor', 'microcontroller', 'arduino', 'stm32', 'linkage', 'pwm', 'pid', 'torque', 'sensor', 'embedded', 'algorithm', 'control', 'actuator', 'encoder', 'driver', 'firmware'],
        summary: `Thank you for narrowing that down. Here is a complete synthesis of the essential concepts drawn from each domain, which will serve as the groundwork for our solution:\n\no Essential Components (Hardware/Software): Servo/Stepper motors, Microcontrollers, Rigid Linkages – Required because: They form the physical actuation and processing units needed for precision.\no Essential Methods & Concepts: PWM signals, PID control algorithms, Kinematics – Required because: They provide the logic and feedback loops for smooth motion.\no System Boundaries (Excluded Elements): Advanced AI for unpredictable tasks – Excluded because: This solution focuses on predictable, repetitive, and controlled movements.\n\n**We are now moving to the next phase.**`,
        navIdx: 2,
        nextState: STATE.PHASE3
    },
    {
        key: 'phase3',
        name: 'Phase 3: Contextualize (Situate the Problem)',
        goal: 'Situate the project within a real-world setting.',
        question: 'We have successfully isolated our essential components and methods. Now, we are moving to the next phase: situating this knowledge in the real world. In what specific real-world setting does this problem occur, or what are the primary applications of this problem?',
        keywords: ['medical', 'surgical', 'hospital', 'industrial', 'factory', 'assembly', 'surgeon', 'worker', 'operating room', 'sterile', 'environment', 'user', 'operator', 'setting', 'floor', 'context', 'deployment'],
        summary: `Thank you for giving a complete picture of the environment. Here is a comprehensive summary of the real-world context that will serve as the operational boundary for our solution:\n\no Real-World Setting & Application: Factory floor or Operating room – This dictates our operational environment.\no End-User Profile: Assembly Workers or Surgeons – This dictates our usability and interface requirements.\no Key Constraints: Cost/budget limits and physical space payload capacities – This dictates what we cannot do.\no Environmental Factors: Dust and temperature resistance, and stringent safety standards (ISO/CE) – This dictates our need for durability and compliance.\n\n**We are now moving to the next phase.**`,
        navIdx: 3,
        nextState: STATE.PHASE4
    },
    {
        key: 'phase4',
        name: 'Phase 4: Integrate (Combine Contents)',
        goal: 'Combine synthesized knowledge with contextual constraints into a unified solution.',
        question: 'We have mapped out our essential components and defined the real-world conditions they must survive in. Now, we are moving to the next phase: integrating these pieces into a unified solution. Looking at the key elements we extracted, how can the selected components from our different domains be initially combined?',
        keywords: ['sensor', 'feedback', 'loop', 'mechanical', 'software', 'limit', 'bound', 'obstacle', 'joint', 'interrupt', 'safety', 'control', 'integration', 'monitor', 'read', 'detect', 'signal', 'stop', 'actuator'],
        summary: `Thank you for designing those connections. Here is a complete integration summary of our unified solution, demonstrating how our disparate domains come together:\n\no Integrated Workflow: Sensor detection -> Microcontroller processing -> Motor actuation – This represents the sequence of operations.\no Component Interactions: Software loops continuously poll sensors and send PWM to motors – This highlights the systemic relationships and data/energy flow.\no Constraint Adaptations: Implementation of emergency stop overrides and restricted joint ranges – This ensures practical viability.\no Problem Resolution: Creating a feedback loop that safely stops motion upon detecting limits – This confirms our core objective is met.\n\n**We are now moving to the next phase.**`,
        navIdx: 4,
        nextState: STATE.PHASE5
    },
    {
        key: 'phase5',
        name: 'Phase 5: Harmonize (Balance and Trade-offs)',
        goal: 'Resolve trade-offs and ensure the solution is feasible and sustainable.',
        question: 'We have successfully integrated our components into a unified workflow. Now, we are moving to the next phase: evaluating and balancing this system. Looking critically at what we\'ve designed, does the integrated solution appropriately balance ideal technical performance with the strict contextual constraints we defined earlier?',
        keywords: ['speed', 'safety', 'trade-off', 'efficiency', 'balance', 'stop', 'sensor', 'person', 'detect', 'slow', 'fast', 'profit', 'cost', 'risk', 'cycle', 'human', 'response', 'time'],
        summary: `Thank you for making those tough decisions. Here is a complete harmonization summary detailing how our solution responsibly balances competing demands:\n\no Resolved Trade-offs: Prioritizing human safety and bounded motion over maximum arm speed – This clarifies what was sacrificed and what was gained.\no Justifications for Priorities: The operating environment requires safe human collaboration (cobot) – This defends the integrity and logic of the design.\no Sustainability & Ethics: Adherence to safety standards and reliable long-term parts ensures minimal harm to operators – This ensures the solution is viable for the future without causing undue harm.\no The Harmonized Solution: A collaborative robotic arm using PID-controlled servos with strict mechanical bounds and safety interruptions – This is our realistic, actionable, and mature blueprint.\n\n**Session Conclusion**\n\nThe structured process we used to analyze your project is known as the **ASCIH framework**:\n- **Analyze** (Identify Domains)\n- **Synthesize** (Extract Domain Knowledge)\n- **Contextualize** (Situate the Problem)\n- **Integrate** (Combine Contents)\n- **Harmonize** (Balance and Trade-offs)\n\nThis framework provides a systematic approach to interdisciplinary engineering problems.\n\nAre you interested in continuing the interaction with another example project?`,
        navIdx: 5,
        nextState: STATE.CONCLUSION
    }
];

// ─── App State ────────────────────────────────────────────────────────────────
let currentState = STATE.AWAITING_GREETING;
let currentProject = '';
let userName = '';
let currentPhaseIdx = 0;   // index into PHASES array (0–4)
let failCount = 0;         // consecutive fails for current question within a phase
let allSubmittedAnswers = [];// remember all user answers to reject repeats globally

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

// ─── Semantic Similarity Engine ───────────────────────────────────────────────
/**
 * Calculates a rough keyword-based semantic similarity score (0–100).
 * Compares user answer against the phase's keyword list.
 */
const computeSimilarity = (userAnswer, phaseKeywords) => {
    const lower = userAnswer.toLowerCase();
    let hits = 0;
    for (const kw of phaseKeywords) {
        if (lower.includes(kw.toLowerCase())) hits++;
    }
    // Score = percentage of keywords matched, capped at 100
    const score = Math.min(100, Math.round((hits / phaseKeywords.length) * 100 * 2.5));
    return score;
};

/**
 * Classify similarity score into evaluation tier.
 * < 20 → wrong, 20–40 → partial, > 40 → acceptable
 */
const classifySimilarity = (score) => {
    if (score >= 41) return 'correct';
    if (score >= 20) return 'partial';
    return 'wrong';
};

// ─── Phase Hint Messages (per phase) ─────────────────────────────────────────
const PHASE_HINTS = [
    'Think about the major engineering disciplines: what physical structure does the arm need, what powers its motion, and what controls it logically?',
    'Consider the actual parts and code: what type of motor moves the arm precisely, what microcontroller runs the code, and what algorithm smooths the motion?',
    'Think about the real destination of this robot — is it in a hospital, a factory, or somewhere else? Who operates it day-to-day?',
    'Think about the feedback loop: how does the robot "know" where its arm is, and how does that information prevent it from causing harm?',
    'Think about two competing goals — speed and safety. What happens if you maximize one and ignore the other?'
];

// ─── Reveal Answers (per phase) ───────────────────────────────────────────────
const PHASE_ANSWERS = [
    'The primary domains are Mechanical Engineering (structure/kinematics), Electrical Engineering (power/actuators), and Computer Science (control logic). Additionally, Control Theory (feedback loops) and Mathematics (Inverse Kinematics) are essential.',
    'Key components include Servo/Stepper motors (Electrical), Microcontrollers like Arduino or STM32 (Software/Electrical), Rigid Linkages (Mechanical), PWM signals, and PID control algorithms for smooth precise motion.',
    'In a Medical setting, the environment is an Operating Room and the end-user is a Surgeon. In an Industrial setting, it is a Factory Floor with Assembly Workers. Each environment imposes different safety and design standards.',
    'The Software reads Sensor data from Joints (Mechanical) to detect if the arm exceeds physical bounds or encounters an obstacle — closing a real-time feedback control loop that ensures safe, bounded motion.',
    'Increasing speed improves efficiency but decreases safety. The balance is found by setting safe speed limits and using sensors to detect nearby humans, instantly slowing or stopping the arm, ensuring it is both productive and safe.'
];

// ─── Core Processing ──────────────────────────────────────────────────────────
const processUserInput = async (input) => {
    if (!input.trim()) return;

    appendMessage(input, true);
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';

    showTyping();
    const delay = Math.random() * 800 + 900;
    setTimeout(() => {
        handleStateTransition(input);
        hideTyping();
    }, delay);
};

// ─── State Machine ────────────────────────────────────────────────────────────
const handleStateTransition = (input) => {
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
                failCount = 0;
                allSubmittedAnswers = [];
                updateSidebarProgress(1);
                const p = PHASES[0];
                appendMessage(`Thank you, ${userName}. We will analyze the **${currentProject}**.\n\n**${p.name}**\n\n*Goal: ${p.goal}*\n\n${p.question}`);
            } else {
                appendMessage('Please provide a more descriptive engineering project to analyze.');
            }
            break;

        case STATE.PHASE1:
        case STATE.PHASE2:
        case STATE.PHASE3:
        case STATE.PHASE4:
        case STATE.PHASE5:
            handlePhaseAnswer(input);
            break;

        case STATE.CONCLUSION:
            if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('ok')) {
                currentState = STATE.FOLLOW_UP;
                updateSidebarProgress(1);
                appendMessage('Excellent! Please provide the next engineering project you would like to analyze, or tell me your engineering domain and I can suggest one for you.');
            } else {
                appendMessage('Thank you for participating in this learning session. The activity is now concluded.');
                elements.userInput.disabled = true;
                elements.sendBtn.disabled = true;
                elements.hintBtn.disabled = true;
            }
            break;

        case STATE.FOLLOW_UP:
            currentProject = input.trim();
            currentState = STATE.PHASE1;
            currentPhaseIdx = 0;
            failCount = 0;
            allSubmittedAnswers = [];
            updateSidebarProgress(1);
            const p0 = PHASES[0];
            appendMessage(`Understood. We will now apply the ASCIH framework to the **${currentProject}**.\n\n**${p0.name}**\n\n*Goal: ${p0.goal}*\n\n${p0.question}`);
            break;
    }
};

// ─── Phase Answer Handler ─────────────────────────────────────────────────────
const handlePhaseAnswer = (input) => {
    const phase = PHASES[currentPhaseIdx];
    const lowerInput = input.toLowerCase().trim();

    // ── Hint request (typed or button) ──
    if (lowerInput === 'hint' || lowerInput.includes('need a hint') || lowerInput.includes('give me a hint') || lowerInput.includes('can i get a hint')) {
        appendMessage('', false, {
            status: 'partial',
            hint: `💡 Hint: ${PHASE_HINTS[currentPhaseIdx]}`
        });
        return;
    }

    // ── Reject repeated / identical answer ──
    if (lowerInput.length > 0 && allSubmittedAnswers.includes(lowerInput)) {
        appendMessage('', false, {
            status: 'wrong',
            hint: 'You have already submitted this exact answer previously. Please provide a new response tailored to the current question.'
        });
        return;
    }

    allSubmittedAnswers.push(lowerInput);

    // ── Similarity evaluation ──
    const score = computeSimilarity(input, phase.keywords);
    const classification = classifySimilarity(score);

    let finalFeedback = '';
    let statusClass = '';

    // ── "Don't know" shortcut ──
    if (lowerInput.includes("don't know") || lowerInput.includes("dont know") || lowerInput.includes("no idea") || lowerInput.includes("not sure")) {
        finalFeedback = `That's okay! Here is the appropriate answer: ${PHASE_ANSWERS[currentPhaseIdx]}`;
        statusClass = 'wrong';
    } else if (classification === 'correct') {
        finalFeedback = `Well done! You identified the key concepts accurately. ${PHASE_ANSWERS[currentPhaseIdx]}`;
        statusClass = 'correct';
    } else if (classification === 'partial') {
        finalFeedback = `You're partially correct, but there is more to it. ${PHASE_ANSWERS[currentPhaseIdx]}`;
        statusClass = 'partial';
    } else {
        finalFeedback = `That's not exactly what we're looking for, but let me provide the actual appropriate answer: ${PHASE_ANSWERS[currentPhaseIdx]}`;
        statusClass = 'wrong';
    }

    // Advance Phase IMMEDIATELY (1 question per phase rule)
    advancePhase(phase, {
        status: statusClass,
        hint: finalFeedback
    });
};

// ─── Phase Advancement ────────────────────────────────────────────────────────
const advancePhase = (phase, feedbackObj) => {
    failCount = 0;
    currentPhaseIdx++;

    // Only output the summary to avoid repeating questions (one question per phase)
    const summaryMsg = `${phase.summary}`;
    appendMessage(summaryMsg, false, feedbackObj);

    // Transition to next state
    currentState = phase.nextState;

    if (currentState === STATE.CONCLUSION) {
        updateSidebarProgress(6); // conclusion nav
    } else if (currentPhaseIdx < PHASES.length) {
        // Ask next phase question
        const nextPhase = PHASES[currentPhaseIdx];
        updateSidebarProgress(nextPhase.navIdx);
        setTimeout(() => {
            appendMessage(`**${nextPhase.name}**\n\n*Goal: ${nextPhase.goal}*\n\n${nextPhase.question}`);
        }, 800);
    }
};

// ─── Hint Button ──────────────────────────────────────────────────────────────
elements.hintBtn.addEventListener('click', () => {
    const isInPhase = currentState >= STATE.PHASE1 && currentState <= STATE.PHASE5;
    if (isInPhase) {
        processUserInput('I need a hint.');
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

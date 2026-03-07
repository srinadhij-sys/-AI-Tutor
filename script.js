/**
 * AI Tutor Web App - Logic & State Machine
 */

// DOM Elements
const elements = {
    chatMessages: document.getElementById('chat-messages'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    resetBtn: document.getElementById('reset-btn'),
    typingIndicator: document.getElementById('typing-indicator'),
    navItems: document.querySelectorAll('.phase-item'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn')
};

// State Machine Definitions
const STATE = {
    AWAITING_GREETING: 0,
    AWAITING_NAME: 1,
    PROJECT_SELECTION: 2,
    PHASE1_ANALYZE: 3,
    PHASE2_SYNTHESIZE: 4,
    PHASE3_CONTEXTUALIZE: 5,
    PHASE4_INTEGRATE: 6,
    PHASE5_HARMONIZE: 7,
    CONCLUSION: 8,
    FOLLOW_UP: 9
};

// Application State
let currentState = STATE.AWAITING_GREETING;
let currentProject = "";
let userName = "";
let interactionCount = 0; // Tracks questions asked per phase

// Utilities
const showTyping = () => {
    elements.typingIndicator.classList.remove('hidden');
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

const hideTyping = () => {
    elements.typingIndicator.classList.add('hidden');
};

const updateSidebarProgress = (phaseIndex) => {
    elements.navItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index < phaseIndex) {
            item.classList.add('completed');
        } else if (index === phaseIndex) {
            item.classList.add('active');
            item.classList.remove('completed');
        } else {
            item.classList.remove('completed');
        }
    });
};

const createMessageHTML = (text, isUser = false, feedbackObj = null) => {
    let html = `
        <div class="message ${isUser ? 'user-message' : 'tutor-message'}">
            <div class="avatar"><i class="${isUser ? 'fa-solid fa-user' : 'fa-solid fa-robot'}"></i></div>
            <div class="bubble">
    `;

    // Process text as paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    paragraphs.forEach(p => {
        html += `<p>${p}</p>`;
    });

    // Add structured feedback if provided
    if (feedbackObj) {
        let tagClass, label;
        if (feedbackObj.status === 'correct' || feedbackObj.status === 'acceptable') {
            tagClass = 'feedback-correct';
            label = 'Acknowledgment';
        } else if (feedbackObj.status === 'partial') {
            tagClass = 'feedback-partial';
            label = 'Partial Answer / Clarification';
        } else {
            tagClass = 'feedback-wrong';
            label = 'Guidance';
        }
        
        html += `
            <div class="feedback-box ${tagClass}">
                <span class="feedback-tag">${label}</span>
                <p><em>${feedbackObj.hint || feedbackObj.explanation}</em></p>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;
    return html;
};

const appendMessage = (text, isUser = false, feedbackObj = null) => {
    const msgHTML = createMessageHTML(text, isUser, feedbackObj);
    elements.chatMessages.insertAdjacentHTML('beforeend', msgHTML);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

let consecutiveFails = 0; // Tracks consecutive non-correct answers

// Core Logic & Evaluation Engine
const evaluateAnswer = (input) => {
    const lower = input.toLowerCase().trim();
    
    // 1. Is it a question?
    if (lower.endsWith('?') || lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('why')) {
        return { type: 'question', hint: "That's a great question. In the context of our analysis, the focus is on breaking down the system into core components. Let's return to the prompt:" };
    }

    // 2. Does the user not know?
    if (lower.includes("don't know") || lower.includes("dont know") || lower.includes("no idea") || lower.includes("not sure")) {
        return { type: 'dont_know', hint: "That's completely fine. The actual underlying concept involves integrating multiple disciplines. For instance, you would typically need to combine mechanical structures with software logic." };
    }

    // 3. Evaluate answer quality (mock)
    const length = input.trim().length;
    let actualAnswer = "The expected concept here involves the integration of mechanical structures with software control logic.";
    
    if (length > 40 || lower.includes('and') || lower.includes('because')) {
        consecutiveFails = 0; // Reset on correct
        return { 
            type: 'answer', 
            status: 'correct', 
            hint: "You accurately identified the key components here." 
        };
    } 
    
    consecutiveFails++;
    const showAnswer = consecutiveFails >= 2;
    
    if (length > 15) {
        return { 
            type: 'answer', 
            status: 'partial', 
            hint: showAnswer 
                ? `You are partially correct about that aspect, but we also need to consider the broader scope.\n\n**Actual Answer:** ${actualAnswer}`
                : `You are partially correct about that aspect. Hint: Try to also consider the software control mechanisms. Try answering again.`
        };
    }

    return { 
        type: 'answer', 
        status: 'wrong', 
        hint: showAnswer
            ? `I see what you're thinking, but the core element involves a slightly different approach.\n\n**Actual Answer:** ${actualAnswer}`
            : `I see what you're thinking, but think broader. Hint: Look at the problem from different engineering disciplines. Try answering again.`
    };
};

const processUserInput = async (input) => {
    if (!input.trim()) return;

    appendMessage(input, true);
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';

    showTyping();
    const delay = Math.random() * 1000 + 1000;
    
    setTimeout(() => {
        handleStateTransition(input);
        hideTyping();
    }, delay);
};

// State Machine Handling
const handleStateTransition = (input) => {
    let responseText = "";
    const lowerInput = input.toLowerCase();

    switch (currentState) {
        case STATE.AWAITING_GREETING:
            if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
                currentState = STATE.AWAITING_NAME;
                responseText = "Hello. I will be your facilitator for an interactive learning session today.\n\nBefore we begin, could you please tell me your name?";
            } else {
                responseText = "Please type \"Hi\" in the chat box to begin the interactive learning session.";
            }
            appendMessage(responseText);
            break;

        case STATE.AWAITING_NAME:
            // Very simple capture - in reality, might want NLP to extract just the name from "my name is Alex"
            userName = input.replace(/my name is|i am|i'm/gi, '').trim();
            // Capitalize first letter
            if(userName.length > 0) {
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            } else {
                userName = "Student";
            }
            currentState = STATE.PROJECT_SELECTION;
            responseText = `Nice to meet you, ${userName}.\n\nThis activity consists of 5 distinct phases where we will analyze an interdisciplinary engineering project. I will guide you through each phase by asking questions and helping you break down the problem.\n\nTo begin, please present a specific engineering project you would like to analyze.`;
            appendMessage(responseText);
            break;

        case STATE.PROJECT_SELECTION:
            if (input.length > 5) {
                currentProject = input;
                currentState = STATE.PHASE1_ANALYZE;
                updateSidebarProgress(1); // Nav Phase 1
                responseText = `Thank you, ${userName}. We will analyze the **${currentProject}**.\n\n**Phase 1: Analyze (Identify Domains)**\n\nOur goal in this phase is to examine the various domains of knowledge involved.\n\nWhat are the different domains of knowledge involved in this problem?`;
            } else {
                responseText = "Please provide a more descriptive engineering project to analyze.";
            }
            appendMessage(responseText);
            break;

        case STATE.PHASE1_ANALYZE:
            handlePhaseLogic(
                input, 
                3, // Number of interactions
                STATE.PHASE2_SYNTHESIZE, 
                2, // Progress Idx
                [
                    "Does this problem require knowledge beyond a single discipline?",
                    "How might these different disciplines intersect to form a complete understanding of the system?"
                ],
                `**Phase 1 Summary: Domain Analysis**\nThe actual domains required for the **${currentProject}** generally include Mechanical Engineering for physical infrastructure, Electrical Engineering for power and sensors, and Computer Science for control algorithms. Each plays a distinct role in ensuring the system functions physically and logically.\n\n**We are now moving to the next phase.**\n\n**Phase 2: Synthesize (Extract Domain Knowledge)**\n\nWhat hardware and software components are specifically involved in these domains?`
            );
            break;
            
        case STATE.PHASE2_SYNTHESIZE:
            handlePhaseLogic(
                input, 3, STATE.PHASE3_CONTEXTUALIZE, 3,
                [
                    "Which domain knowledge can be excluded as non-essential for the core functionality?",
                    "Why are the remaining components absolutely necessary for the foundation of the project?"
                ],
                `**Phase 2 Summary: Synthesize**\nThe essential concepts drawn from these domains include microcontroller processing, sensor data acquisition, and actuator mechanics. They prepare the groundwork by providing the necessary means to read the environment and execute actions.\n\n**We are now moving to the next phase.**\n\n**Phase 3: Contextualize (Situate the Problem)**\n\nIn what real-world setting does this problem occur?`
            );
            break;

        case STATE.PHASE3_CONTEXTUALIZE:
            handlePhaseLogic(
                input, 2, STATE.PHASE4_INTEGRATE, 4,
                [
                    "What are the applications of this problem, and who are the end-users?"
                ],
                `**Phase 3 Summary: Contextualize**\nThe real-world setting involves dynamic environments where constraints such as weather, cost, and user safety play a massive role. These contextual conditions dictate how robust the final solution must be.\n\n**We are now moving to the next phase.**\n\n**Phase 4: Integrate (Combine Contents)**\n\nHow can the selected components from different domains be combined effectively?`
            );
            break;

        case STATE.PHASE4_INTEGRATE:
             handlePhaseLogic(
                input, 2, STATE.PHASE5_HARMONIZE, 5,
                [
                    "What specific relationships or communication protocols exist between the hardware and software components?"
                ],
                `**Phase 4 Summary: Integrate**\nThe integrated workflow requires a seamless loop: sensors (electrical) capture data, software algorithms (computer science) process it, and mechanical components execute the response, addressing the problem collectively.\n\n**We are now moving to the next phase.**\n\n**Phase 5: Harmonize (Balance and Trade-offs)**\n\nDoes the integrated solution appropriately balance technical performance with the contextual constraints we discussed?`
            );
            break;
            
        case STATE.PHASE5_HARMONIZE:
             handlePhaseLogic(
                input, 2, STATE.CONCLUSION, 6,
                [
                    "What trade-offs exist between cost, efficiency, safety, ethics, or usability in your solution?"
                ],
                `**Phase 5 Summary: Harmonize**\nThe harmonized solution resolves the tension between high efficiency and cost constraints by selecting optimized, mid-tier components. This achieves a coherent and responsible design.\n\n**Session Conclusion**\n\nThe structured process we just used to analyze your project is known as the **ASCIH framework**:\n- **Analyze** (Identify Domains)\n- **Synthesize** (Extract Domain Knowledge)\n- **Contextualize** (Situate the Problem)\n- **Integrate** (Combine Contents)\n- **Harmonize** (Balance and Trade-offs)\n\nThis framework provides a systematic approach to interdisciplinary engineering problems.\n\nAre you interested in continuing the interaction with another example project?`
            );
            break;

        case STATE.CONCLUSION:
            if (lowerInput.includes('yes') || lowerInput.includes('sure')) {
                currentState = STATE.FOLLOW_UP;
                updateSidebarProgress(1); // Reset visually
                appendMessage("Excellent. Please provide the next engineering project you would like to analyze, or tell me your engineering domain and I can suggest one for you.");
            } else {
                appendMessage("Thank you for participating in this learning session. The activity is now concluded.");
                elements.userInput.disabled = true;
                elements.sendBtn.disabled = true;
            }
            break;
            
        case STATE.FOLLOW_UP:
            currentProject = input;
            currentState = STATE.PHASE1_ANALYZE;
            interactionCount = 0;
            updateSidebarProgress(1);
            appendMessage(`Understood. We will now apply the ASCIH framework to the **${currentProject}**.\n\n**Phase 1: Analyze (Identify Domains)**\n\nWhat are the different domains of knowledge involved in this problem?`);
            break;
    }
};

const handlePhaseLogic = (input, maxQuestions, nextState, nextNavIdx, followUpQuestions, summaryText) => {
    // 1. Evaluate answer based on new guidelines
    const evalResult = evaluateAnswer(input);
    
    let feedback = null;

    if (evalResult.type === 'question') {
        feedback = { status: 'partial', hint: evalResult.hint };
    } else if (evalResult.type === 'dont_know') {
        feedback = { status: 'wrong', hint: evalResult.hint };
    } else {
        // evaluation of provided answer
        let statObj = 'partial';
        if(evalResult.status === 'correct') statObj = 'correct';
        if(evalResult.status === 'wrong') statObj = 'wrong';
        feedback = { status: statObj, hint: evalResult.hint };
        
        // If they failed but we haven't shown the actual answer yet (consecutiveFails < 2),
        // we should prompt them to try again instead of moving to the next question.
        if ((statObj === 'wrong' || statObj === 'partial') && consecutiveFails < 2) {
             appendMessage(feedback.hint, false, feedback);
             return; // Early return to force them to try again without advancing the phase interaction count
        }
    }

    // Only increment interaction count if correct, 'don't know', question handled, or if we revealed the actual answer
    interactionCount++;

    // 2. Determine Next Action
    if (interactionCount < maxQuestions) {
        // Ask Next Question in the phase
        const nextQ = followUpQuestions[interactionCount - 1];
        appendMessage(nextQ, false, feedback);
    } else {
        // Phase Complete! Transition to next
        interactionCount = 0;
        currentState = nextState;
        updateSidebarProgress(nextNavIdx);
        appendMessage(summaryText, false, feedback);
    }
};

// Event Listeners
elements.sendBtn.addEventListener('click', () => {
    processUserInput(elements.userInput.value);
});

elements.userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        processUserInput(elements.userInput.value);
    }
});

elements.userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') {
        this.style.height = 'auto';
    }
});

elements.resetBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to reset the session?')) {
        location.reload();
    }
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

// Close sidebar when clicking a nav item on mobile
elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('open');
            elements.sidebarOverlay.classList.remove('open');
        }
    });
});

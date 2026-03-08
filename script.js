/**
 * AI Tutor Web App - Logic & State Machine
 */

// DOM Elements
const elements = {
    chatMessages: document.getElementById('chat-messages'),
    userInput: document.getElementById('user-input'),
    hintBtn: document.getElementById('hint-btn'),
    sendBtn: document.getElementById('send-btn'),
    resetBtn: document.getElementById('reset-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    leaderboardModal: document.getElementById('leaderboard-modal'),
    closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
    leaderboardBody: document.getElementById('leaderboard-body'),
    adminModal: document.getElementById('admin-modal'),
    adminModalTitle: document.getElementById('admin-modal-title'),
    adminModalDesc: document.getElementById('admin-modal-desc'),
    editScoreContainer: document.getElementById('edit-score-container'),
    newScoreInput: document.getElementById('new-score-input'),
    adminPasswordInput: document.getElementById('admin-password-input'),
    adminErrorMsg: document.getElementById('admin-error-msg'),
    confirmAdminBtn: document.getElementById('confirm-admin-btn'),
    cancelAdminBtn: document.getElementById('cancel-admin-btn'),
    closeAdminBtn: document.getElementById('close-admin-btn'),
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
let totalScore = 0; // Tracks total score across the session

// Admin State
let adminActionContext = {
    action: null, // 'edit' or 'delete'
    studentName: null,
    currentScore: null
};

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

    // Add Answer Accuracy message if available
    if (feedbackObj && feedbackObj.similarity !== undefined) {
         html += `<p style="margin-top: 10px; font-weight: 600; font-size: 0.9em; color: var(--primary-color);">🎯 Answer Accuracy: ${feedbackObj.similarity}%</p>`;
    }

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
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span class="feedback-tag" style="margin-bottom: 0;">${label}</span>
                </div>
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

// Strict Rules State
let consecutiveFails = 0; // Tracks consecutive non-correct answers

const getHintForCurrentQuestion = (state) => {
    const hints = {
        [STATE.PHASE1_ANALYZE]: [
            "Think about the main branches of engineering (e.g., software, mechanical, electrical) and how they apply here.",
            "Consider if the problem can be solved by just one type of engineer, or if it needs a team of different experts.",
            "Reflect on what tasks each type of engineer would be responsible for.",
            "Imagine how moving parts, power sources, and computer brains work together in this system.",
            "Think about less obvious areas like materials science or human-computer interaction."
        ],
        [STATE.PHASE2_SYNTHESIZE]: [
            "What actual physical parts (sensors, motors) and digital logic (code) are needed?",
            "Which domain knowledge can be safely ignored without breaking the core functionality?",
            "Focus on the absolute minimum viable theories and mechanisms needed.",
            "How do these individual pieces act as stepping stones for the whole system?",
            "Why are these specific core components the absolute building blocks for this project?"
        ],
        [STATE.PHASE3_CONTEXTUALIZE]: [
            "Where would this be used in the real world? E.g., a factory, a hospital, or outdoors?",
            "Think about limits like budget, space, weather, or rules and regulations.",
            "Think about who the final users are and what their specific needs or limitations might be.",
            "Consider how temperature, dirt, or user wear-and-tear might affect the system.",
            "Think about the broader impact and the main use cases for the solution."
        ],
        [STATE.PHASE4_INTEGRATE]: [
            "How do the different parts we identified talk to each other to perform a single function?",
            "Think about the actual connections: APIs, wires, mechanical joints.",
            "Consider the flow of data: what specific rules or connections bind the hardware and software?",
            "Focus on the specific standards or methods used to unite the components.",
            "How does combining these parts solve the problem better than they could individually?"
        ],
        [STATE.PHASE5_HARMONIZE]: [
            "Does the solution try to maximize performance while keeping the costs and size reasonable?",
            "Think about balancing user safety, materials cost, and efficiency.",
            "Consider if making it cheaper makes it less safe, or if making it faster uses too much power.",
            "Why is your chosen balance better than alternative approaches?",
            "How do all these compromises result in a viable, responsible final product?"
        ]
    };

    if (hints[state] && hints[state][0]) {
        return `Here's a hint: ${hints[state][0]}`;
    }
    
    return "Here's a hint to guide you: consider the underlying concepts related to software logic, mechanical structure, and their integration.";
};

// Core Logic & Evaluation Engine
const evaluateAnswer = (input) => {
    const lower = input.toLowerCase().trim();
    
    // 0. Is it a hint request?
    if (lower === 'hint' || lower.includes('need a hint') || lower.includes('give me a hint') || lower.includes('can i get a hint')) {
        return { 
            type: 'hint', 
            status: 'partial',
            hint: getHintForCurrentQuestion(currentState, interactionCount)
        };
    }

    // 1. Does the user not know?
    if (lower.includes("don't know") || lower.includes("dont know") || lower.includes("no idea") || lower.includes("not sure")) {
        return { type: 'dont_know', status: 'wrong', hint: "That's completely fine. The actual underlying concept typically involves integrating multiple disciplines, such as combining mechanical structures with software logic and electrical sensors." };
    }

    // 2. Is it a question?
    if (lower.endsWith('?') || lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('why')) {
        return { type: 'question', status: 'partial', hint: "That's a great question. In the context of our analysis, the focus is on breaking down the system into its core functional requirements. Let's proceed with our systematic evaluation." };
    }

    // 3. Evaluate answer quality (simulated similarity percentage)
    let actualAnswer = "The expected concept here firmly relies on the integration of mechanical structures, real-time sensor data, and sophisticated software control logic.";
    
    switch (currentState) {
        case STATE.PHASE1_ANALYZE:
            actualAnswer = "This problem requires multiple disciplines, specifically mechanical engineering for the physical structure, electrical engineering for sensors, and computer science for software logic.";
            break;
        case STATE.PHASE2_SYNTHESIZE:
            actualAnswer = "The essential components are physical sensors and actuators to interact with the environment, and a microcontroller with code to process data and make decisions.";
            break;
        case STATE.PHASE3_CONTEXTUALIZE:
            actualAnswer = "The real-world constraints include physical limitations like space or weather, budget, safety regulations, and the specific needs of the end-users interacting with the system.";
            break;
        case STATE.PHASE4_INTEGRATE:
            actualAnswer = "The components are integrated through communication protocols, electrical wiring, and physical joints, allowing the software to read sensor data and control the mechanical parts.";
            break;
        case STATE.PHASE5_HARMONIZE:
            actualAnswer = "Balancing technical performance with constraints means making trade-offs, like optimizing code for a cheaper processor or choosing materials that are safe but cost-effective.";
            break;
    }
    
    // Simulate a simple word overlap similarity percentage (0-100)
    const getWords = text => text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").split(/\s+/).filter(w => w.length > 2);
    const inputWords = getWords(input);
    
    // Check if user is just copying the hint
    const currentHint = getHintForCurrentQuestion(currentState);
    const hintWords = getWords(currentHint);
    const hintSet = new Set(hintWords);
    
    let hintMatchCount = 0;
    inputWords.forEach(word => {
        if (hintSet.has(word)) hintMatchCount++;
    });
    
    const inputHintRate = inputWords.length > 0 ? (hintMatchCount / inputWords.length) * 100 : 0;
    
    if (inputHintRate > 60) {
        return {
            type: 'answer',
            status: 'wrong',
            hint: "Please try to explain the concept in your own words instead of repeating the hint I provided. Actual Answer: " + actualAnswer,
            similarity: 0
        };
    }

    const targetWords = getWords(actualAnswer);
    
    const targetSet = new Set(targetWords);
    let matchCount = 0;
    inputWords.forEach(word => {
        if (targetSet.has(word)) matchCount++;
    });
    
    let similarityPercent = targetSet.size > 0 ? (matchCount / targetSet.size) * 100 : 0;
    
    // Bonus points for input length and conjunctions to simulate semantic richness
    const length = input.trim().length;
    if (length > 40) similarityPercent += 15;
    if (lower.includes('and') || lower.includes('because') || lower.includes('therefore')) similarityPercent += 15;
    
    similarityPercent = Math.min(100, Math.max(0, similarityPercent));

    // Threshold evaluation based on requested rules:
    // Minimum similarity > 40% -> Acceptable answer
    const similarityDisplay = Math.round(similarityPercent);
    
    if (similarityPercent >= 40) {
        return { 
            type: 'answer', 
            status: 'correct', 
            hint: `Great response! You accurately identified the key components. To add to that: ${actualAnswer}`,
            similarity: similarityDisplay
        };
    } 
    
    // Similarity between 20% and 39% -> Partial (Give Hint)
    if (similarityPercent >= 20 && similarityPercent <= 39) {
        return { 
            type: 'answer', 
            status: 'partial', 
            hint: `You are partially heading in the right direction, but we need more accuracy.\n\n${getHintForCurrentQuestion(currentState)}`,
            similarity: similarityDisplay
        };
    }

    // Similarity < 20% -> Wrong answer
    return { 
        type: 'answer', 
        status: 'wrong', 
        hint: `I understand your perspective, but the core element involves a different approach.\n\n${getHintForCurrentQuestion(currentState)}`,
        similarity: similarityDisplay
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
            userName = input.replace(/my name is|i am|i'm/gi, '').trim();
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
            if (lowerInput === 'yes' || lowerInput === 'sure' || lowerInput === 'proceed') {
                currentProject = "Smart Autonomous System";
                currentState = STATE.PHASE1_ANALYZE;
                updateSidebarProgress(1); // Nav Phase 1
                responseText = `Thank you, ${userName}. We will analyze the **${currentProject}**.\n\n**Phase 1: Analyze (Identify Domains)**\n\nOur goal in this phase is to examine the various domains of knowledge involved.\n\nWhat are the different domains of knowledge involved in this problem?`;
            } else if (input.length > 3) {
                currentProject = input;
                currentState = STATE.PHASE1_ANALYZE;
                updateSidebarProgress(1); // Nav Phase 1
                responseText = `Thank you, ${userName}. We will analyze the **${currentProject}**.\n\n**Phase 1: Analyze (Identify Domains)**\n\nOur goal in this phase is to examine the various domains of knowledge involved.\n\nWhat are the different domains of knowledge involved in this problem?`;
            } else {
                responseText = "Please provide a more descriptive engineering project to analyze, or reply 'yes' to use a suggested one.";
            }
            appendMessage(responseText);
            break;

        case STATE.PHASE1_ANALYZE:
            handlePhaseLogic(
                input, 
                1, // Number of interactions
                STATE.PHASE2_SYNTHESIZE, 
                2, // Progress Idx
                `**Phase 1 Summary: Domain Analysis**\nThe actual domains required for the **${currentProject}** generally include Mechanical Engineering for physical infrastructure, Electrical Engineering for power and sensors, and Computer Science for control algorithms. Each plays a distinct role in ensuring the system functions physically and logically.\n\n**We are now moving to the next phase.**\n\n**Phase 2: Synthesize (Extract Domain Knowledge)**\n\nWhat hardware and software components are specifically involved in these domains?`
            );
            break;
            
        case STATE.PHASE2_SYNTHESIZE:
            handlePhaseLogic(
                input, 1, STATE.PHASE3_CONTEXTUALIZE, 3,
                `**Phase 2 Summary: Synthesize**\nThe essential concepts drawn from these domains include microcontroller processing, sensor data acquisition, and actuator mechanics. They prepare the groundwork by providing the necessary means to read the environment and execute actions.\n\n**We are now moving to the next phase.**\n\n**Phase 3: Contextualize (Situate the Problem)**\n\nIn what real-world setting does this problem occur?`
            );
            break;

        case STATE.PHASE3_CONTEXTUALIZE:
            handlePhaseLogic(
                input, 1, STATE.PHASE4_INTEGRATE, 4,
                `**Phase 3 Summary: Contextualize**\nThe real-world setting involves dynamic environments where constraints such as weather, cost, and user safety play a massive role. These contextual conditions dictate how robust the final solution must be.\n\n**We are now moving to the next phase.**\n\n**Phase 4: Integrate (Combine Contents)**\n\nHow can the selected components from different domains be combined effectively?`
            );
            break;

        case STATE.PHASE4_INTEGRATE:
             handlePhaseLogic(
                input, 1, STATE.PHASE5_HARMONIZE, 5,
                `**Phase 4 Summary: Integrate**\nThe integrated workflow requires a seamless loop: sensors (electrical) capture data, software algorithms (computer science) process it, and mechanical components execute the response, addressing the problem collectively.\n\n**We are now moving to the next phase.**\n\n**Phase 5: Harmonize (Balance and Trade-offs)**\n\nDoes the integrated solution appropriately balance technical performance with the contextual constraints we discussed?`
            );
            break;
            
        case STATE.PHASE5_HARMONIZE:
             handlePhaseLogic(
                input, 1, STATE.CONCLUSION, 6,
                `**Phase 5 Summary: Harmonize**\nThe harmonized solution resolves the tension between high efficiency and cost constraints by selecting optimized, mid-tier components. This achieves a coherent and responsible design.\n\n**Session Conclusion**\n\nThe structured process we just used to analyze your project is known as the **ASCIH framework**:\n- **Analyze** (Identify Domains)\n- **Synthesize** (Extract Domain Knowledge)\n- **Contextualize** (Situate the Problem)\n- **Integrate** (Combine Contents)\n- **Harmonize** (Balance and Trade-offs)\n\nThis framework provides a systematic approach to interdisciplinary engineering problems.\n\nAre you interested in continuing the interaction with another example project?`
            );
            break;

        case STATE.CONCLUSION:
            if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('yep') || lowerInput.includes('ok') || lowerInput.includes('interested')) {
                currentState = STATE.FOLLOW_UP;
                updateSidebarProgress(1); // Reset visually
                appendMessage("Excellent. Please provide the next engineering project you would like to analyze. Alternatively, you can tell me your engineering domain, and I can suggest a project for you.");
            } else {
                appendMessage("Thank you for participating in this learning session. The activity is now concluded.");
                elements.userInput.disabled = true;
                elements.sendBtn.disabled = true;
            }
            break;
            
        case STATE.FOLLOW_UP:
            if (lowerInput.includes('suggest') || lowerInput.includes('domain') || input.length < 20) {
                 const domain = input.replace(/suggest|my domain is|my domain/gi, '').trim() || 'your domain';
                 appendMessage(`Based on ${domain}, I suggest analyzing a **Smart Automation System**. Would you like to proceed with this project? (Reply "yes" or specify your own project)`);
                 currentState = STATE.PROJECT_SELECTION;
            } else {
                 currentProject = input;
                 currentState = STATE.PHASE1_ANALYZE;
                 interactionCount = 0;
                 updateSidebarProgress(1);
                 appendMessage(`Understood. We will now apply the ASCIH framework to the **${currentProject}**.\n\n**Phase 1: Analyze (Identify Domains)**\n\nWhat are the different domains of knowledge involved in this problem?`);
            }
            break;
    }
};

const handlePhaseLogic = (input, maxQuestions, nextState, nextNavIdx, summaryText) => {
    // 1. Evaluate answer based on new guidelines
    const evalResult = evaluateAnswer(input);
    
    let feedback = { status: evalResult.status || 'partial', hint: evalResult.hint, similarity: evalResult.similarity };

    if (evalResult.type === 'hint') {
        appendMessage(feedback.hint, false, feedback);
        return; // Early return so they can answer the actual question
    }
    
    // 2. Determine Penalty / Progression Rules
    if (evalResult.status !== 'correct') {
        consecutiveFails++;
        
        if (consecutiveFails >= 3) {
            // Strict enforce: 3 consecutive fails = force next phase, 0 marks
            consecutiveFails = 0;
            const targetAnswer = evaluateAnswer("").hint.split("Actual Answer: ")[1] || "The expected concept relied on cross-disciplinary mechanics and control logic.";
            feedback.hint = `You have reached the maximum number of attempts for this phase. The correct answer was: ${targetAnswer}\n\nYou receive 0 points for this question. Let's move on.`;
            feedback.status = 'wrong';
            // Force transition
            currentState = nextState;
            updateSidebarProgress(nextNavIdx);
            
            if (nextState === STATE.CONCLUSION) {
                console.log(`Submitting score ${totalScore} for user ${userName}`);
                submitScore(userName, parseInt(totalScore, 10));
                summaryText += `\n\n**Your Total Session Score: ${Math.round(totalScore)}**`;
            }
            
            appendMessage(summaryText, false, feedback);
            return;
        }
        
        // Under 3 fails -> Stay on current question, give hint
        appendMessage(feedback.hint, false, feedback);
        
    } else {
        // >= 40% -> Phase Complete! Give marks and transition
        consecutiveFails = 0;
        
        if (evalResult.similarity !== undefined) {
            totalScore += evalResult.similarity;
        }
        
        currentState = nextState;
        updateSidebarProgress(nextNavIdx);
        
        if (nextState === STATE.CONCLUSION) {
            console.log(`Submitting score ${totalScore} for user ${userName}`);
            submitScore(userName, parseInt(totalScore, 10));
            summaryText += `\n\n**Your Total Session Score: ${Math.round(totalScore)}**`;
        }
        
        appendMessage(summaryText, false, feedback);
    }
};

const submitScore = async (name, score) => {
    try {
        await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_name: name, score: score }),
        });
    } catch (err) {
        console.error('Failed to submit score:', err);
    }
};

const fetchAndDisplayLeaderboard = async () => {
    if (!elements.leaderboardBody || !elements.leaderboardModal) return;
    
    elements.leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Fetching rankings...</td></tr>';
    elements.leaderboardModal.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/leaderboard');
        const text = await response.text();
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${text}`);
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error('Received non-JSON response from server.');
        }
        
        if (data.success && data.leaderboard) {
            elements.leaderboardBody.innerHTML = '';
            
            if (data.leaderboard.length === 0) {
                elements.leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No scores yet. Be the first!</td></tr>';
                return;
            }
            
            data.leaderboard.forEach(entry => {
                const rankClass = entry.rank <= 3 ? `rank-${entry.rank}` : '';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="${rankClass}">${entry.rank}</td>
                    <td>${entry.student_name}</td>
                    <td>${entry.score}</td>
                    <td>
                        <button class="icon-btn edit-btn" data-name="${entry.student_name}" data-score="${entry.score}" title="Edit Score" style="display: inline-flex; width: 28px; height: 28px; font-size: 0.9rem;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="icon-btn delete-btn" data-name="${entry.student_name}" title="Delete Record" style="display: inline-flex; width: 28px; height: 28px; font-size: 0.9rem; color: var(--error);">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                elements.leaderboardBody.appendChild(row);
            });
            
            // Attach event listeners to new buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => openAdminModal('edit', e.currentTarget.dataset.name, e.currentTarget.dataset.score));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => openAdminModal('delete', e.currentTarget.dataset.name));
            });
        }
    } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        elements.leaderboardBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--error); font-size: 0.9rem;">Error: ${err.message}</td></tr>`;
    }
};

const openAdminModal = (action, studentName, score = null) => {
    adminActionContext = { action, studentName, currentScore: score };
    
    // Reset inputs
    elements.adminPasswordInput.value = '';
    elements.adminErrorMsg.style.display = 'none';
    elements.confirmAdminBtn.disabled = false;
    elements.confirmAdminBtn.innerHTML = 'Confirm';
    
    if (action === 'edit') {
        elements.adminModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square" style="margin-right: 10px;"></i> Edit Score';
        elements.adminModalDesc.textContent = `You are editing the score for ${studentName}. Enter the new score and admin password.`;
        elements.editScoreContainer.style.display = 'flex';
        elements.newScoreInput.value = score;
    } else {
        elements.adminModalTitle.innerHTML = '<i class="fa-solid fa-trash" style="margin-right: 10px; color: var(--error);"></i> Delete Record';
        elements.adminModalDesc.textContent = `You are about to permanently delete the record for ${studentName}. Enter admin password to verify.`;
        elements.editScoreContainer.style.display = 'none';
    }
    
    elements.adminModal.classList.remove('hidden');
    elements.adminPasswordInput.focus();
};

const closeAdminModal = () => {
    elements.adminModal.classList.add('hidden');
    adminActionContext = { action: null, studentName: null, currentScore: null };
};

const handleAdminAction = async () => {
    const password = elements.adminPasswordInput.value;
    if (!password) {
        elements.adminErrorMsg.textContent = 'Password is required.';
        elements.adminErrorMsg.style.display = 'block';
        return;
    }
    
    let payload = {
        action: adminActionContext.action,
        student_name: adminActionContext.studentName,
        password: password
    };
    
    if (adminActionContext.action === 'edit') {
        const newScore = parseInt(elements.newScoreInput.value, 10);
        if (isNaN(newScore)) {
            elements.adminErrorMsg.textContent = 'Please enter a valid numeric score.';
            elements.adminErrorMsg.style.display = 'block';
            return;
        }
        payload.score = newScore;
    }
    
    // UI Loading state
    elements.adminErrorMsg.style.display = 'none';
    elements.confirmAdminBtn.disabled = true;
    elements.confirmAdminBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    
    try {
        const response = await fetch('/api/admin-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to perform action');
        }
        
        // Success
        closeAdminModal();
        fetchAndDisplayLeaderboard(); // Refresh data
        
    } catch (err) {
        elements.adminErrorMsg.textContent = err.message || 'An error occurred.';
        elements.adminErrorMsg.style.display = 'block';
        elements.confirmAdminBtn.disabled = false;
        elements.confirmAdminBtn.innerHTML = 'Confirm';
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

elements.hintBtn.addEventListener('click', () => {
    if (currentState >= STATE.PHASE1_ANALYZE && currentState <= STATE.PHASE5_HARMONIZE) {
        processUserInput("I need a hint.");
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

if (elements.fullscreenBtn) {
    elements.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const icon = elements.fullscreenBtn.querySelector('i');
        if (document.fullscreenElement) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
            elements.fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
        } else {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
            elements.fullscreenBtn.setAttribute('title', 'Toggle Fullscreen');
        }
    });
}

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

if (elements.leaderboardBtn) {
    elements.leaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
}

if (elements.closeLeaderboardBtn) {
    elements.closeLeaderboardBtn.addEventListener('click', () => {
        elements.leaderboardModal.classList.add('hidden');
    });
}

// Admin Modal Listeners
if (elements.closeAdminBtn) elements.closeAdminBtn.addEventListener('click', closeAdminModal);
if (elements.cancelAdminBtn) elements.cancelAdminBtn.addEventListener('click', closeAdminModal);
if (elements.confirmAdminBtn) elements.confirmAdminBtn.addEventListener('click', handleAdminAction);

if (elements.adminPasswordInput) {
    elements.adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdminAction();
    });
}
if (elements.newScoreInput) {
    elements.newScoreInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdminAction();
    });
}

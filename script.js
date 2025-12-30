// TODO: Change the main congratulation message text here
const CONGRATULATION_MESSAGE = "Շնորհավոր Նոր Տարի 🎄\n\nԹող 2026-ը քեզ բերի անսահման ուրախություն, առողջություն, հաջողություն և ամեն օր լի լինի գեղեցիկ պահերով։ Թող Նոր Տարին քեզ համար լինի լի հնարավորություններով, նոր ձեռքբերումներով և անմոռանալի հիշողություններով ✨";

// TODO: Change the additional message text here (appears after main message)
// Leave empty string "" if you don't want additional text
const ADDITIONAL_MESSAGE = "Թող ամեն ցանկությունդ իրականանա, ամեն երազանքդ կատարվի, և ամեն օրը բերի քեզ նոր պատճառներ ժպտալու և երջանիկ լինելու համար 🌟\n\nԹող այս տարին լինի քո համար հատուկ, լի գեղեցիկ պահերով և անմոռանալի արկածներով 💫";

// TODO: Change the signature/closing text here (appears last)
// Leave empty string "" if you don't want a signature
const SIGNATURE_MESSAGE = "Մաղթում եմ քեզ ամենայն բարիք\n\nԹող 2026-ը լինի քո ամենագեղեցիկ տարին ✨";

// TODO: Customize quest steps here
const QUEST_STEPS = [
    { 
        type: "search", 
        icon: "⭐", 
        text: "Գտիր թաքնված աստղը", 
        hint: "Որոնիր էկրանի վերևում, կենտրոնում - կտեսնես փայլուն աստղը ⭐" 
    },
    { 
        type: "pattern", 
        icon: "✨", 
        text: "Գտիր ճիշտ հաջորդականությունը", 
        hint: "Կտտացրու աստղերին ճիշտ հերթականությամբ" 
    },
    { 
        type: "memory", 
        icon: "🎁", 
        text: "Հիշողության խաղ", 
        hint: "Հիշիր և կտտացրու ճիշտ խորհրդանիշներին" 
    },
    { 
        type: "counting", 
        icon: "🎄", 
        text: "Հաշվարկի մարտահրավեր", 
        hint: "Հաշվիր քանի աստղ ես տեսնում" 
    }
];

// TODO: Customize achievement messages (shown when each step is completed)
const ACHIEVEMENT_MESSAGES = [
    "Հիանալի! Դու գտար առաջին աստղը ⭐",
    "Վայ, ինչ գեղեցիկ! Շարունակիր այսպես ✨",
    "Դու անհավատալի ես! Շատ լավ արեցիր 🎁",
    "Կատարյալ! Դու ավարտեցիր բոլոր մարտահրավերները 🎄"
];

// Telegram Configuration
// TODO: Replace with your serverless function URL (e.g., from Vercel, Netlify, etc.)
const TELEGRAM_API_URL = 'https://antsanot123.vercel.app/api/telegram';

// Quest game state
let questGameState = {
    patternSequence: [],
    patternUserInput: [],
    memoryCards: [],
    memoryFlipped: [],
    memoryMatches: 0,
    countingAnswer: 0
};

// State management
let snowflakes = [];
let questState = {
    currentStep: 0,
    completedSteps: [],
    hiddenElements: []
};

// Telegram tracking state
let telegramTracking = {
    pageLoadTime: Date.now(),
    questButtonClicked: false,
    questStepsCompleted: [],
    allQuestsCompleted: false,
    messageOpened: false,
    messageOpenTime: null,
    scrollEvents: [],
    maxScrollPercentage: 0,
    userIP: null,
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initVideo();
    initSoundButton();
    initVideoQuestButton();
    initSnow();
    initPageUnloadTracking();
    trackMessageOpen();
    sendTelegramNotification('page_load');
});

// Track scroll in message container
function initMessageScrollTracking() {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    let scrollTimeout;
    
    messageContainer.addEventListener('scroll', () => {
        const scrollTop = messageContainer.scrollTop;
        const scrollHeight = messageContainer.scrollHeight;
        const clientHeight = messageContainer.clientHeight;
        const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        
        // Update max scroll percentage
        if (scrollPercentage > telegramTracking.maxScrollPercentage) {
            telegramTracking.maxScrollPercentage = scrollPercentage;
        }
        
        // Track scroll events (throttled)
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            telegramTracking.scrollEvents.push({
                percentage: scrollPercentage,
                timestamp: Date.now()
            });
        }, 500); // Track every 500ms
    });
}

// Track when message container becomes visible
function trackMessageOpen() {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (messageContainer.classList.contains('visible') && !telegramTracking.messageOpened) {
                    telegramTracking.messageOpened = true;
                    telegramTracking.messageOpenTime = Date.now();
                    sendTelegramNotification('message_opened');
                    initMessageScrollTracking();
                }
            }
        });
    });

    observer.observe(messageContainer, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// Track time spent and send notification when user leaves
function initPageUnloadTracking() {
    // Use visibilitychange for better tracking (works when tab is hidden/closed)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // User switched tab or closed browser
            sendTelegramNotification('page_unload');
        }
    });

    // Also track beforeunload as backup
    window.addEventListener('beforeunload', () => {
        sendTelegramNotification('page_unload');
    });
    
    // Track page focus/blur
    window.addEventListener('blur', () => {
        // User switched away from tab
    });
}

// Initialize video background
function initVideo() {
    const video = document.getElementById('backgroundVideo');
    if (!video) return;
    
    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     (window.innerWidth <= 768);
    
    // Set appropriate video source based on device
    const desktopSource = document.getElementById('desktopVideo');
    const mobileSource = document.getElementById('mobileVideo');
    
    if (isMobile && mobileSource) {
        // Use mobile video
        video.src = mobileSource.src;
        console.log('Using mobile video:', mobileSource.src);
    } else if (desktopSource) {
        // Use desktop video
        video.src = desktopSource.src;
        console.log('Using desktop video:', desktopSource.src);
    }
    
    // Reload video with new source
    video.load();
    
    // Disable controls and prevent user interaction
    video.controls = false;
    video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
    video.setAttribute('disablePictureInPicture', 'true');
    
    // Set volume to maximum
    video.volume = 1.0;
    
    // Ensure video loops continuously
    video.loop = true;
    
    // Track if user has interacted
    let userHasInteracted = false;
    
    // Mark user interaction
    const markInteraction = () => {
        userHasInteracted = true;
    };
    
    // Try to play video - start muted for autoplay compatibility
    const playVideo = () => {
        // Start with muted for autoplay (browsers allow muted autoplay)
        video.muted = true;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video playing muted (autoplay enabled)');
                
                // Unmute function - call on user interaction
                let unmuteAttempted = false;
                const unmuteVideo = (event) => {
                    // Prevent multiple unmute attempts
                    if (unmuteAttempted) return;
                    unmuteAttempted = true;
                    
                    // Only try to unmute if video is currently muted and playing
                    if (video.muted && !video.paused) {
                        video.muted = false;
                        console.log('Video unmuted - sound enabled');
                        userHasInteracted = true;
                    }
                    
                    // Remove all listeners after unmuting
                    document.removeEventListener('click', unmuteVideo);
                    document.removeEventListener('touchstart', unmuteVideo);
                };
                
                // Set up unmute listeners - only on click and touch
                // Note: Sound button and quest button have their own handlers
                document.addEventListener('click', unmuteVideo, { once: true });
                document.addEventListener('touchstart', unmuteVideo, { once: true });
            }).catch(error => {
                console.log('Video autoplay failed, waiting for user interaction:', error);
                // If autoplay fails completely, wait for user interaction
                const playOnInteraction = () => {
                    video.muted = false; // Try with sound on user interaction
                    video.play().then(() => {
                        console.log('Video playing with sound after user interaction');
                        userHasInteracted = true;
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                    }).catch(err => {
                        console.log('Video play failed:', err);
                    });
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
        }
    };
    
    // Wait for video to be ready before playing (after source change)
    const startVideoPlayback = () => {
        if (video.readyState >= 2) {
            // Video is already loaded
            playVideo();
        } else {
            // Wait for video to load - use canplaythrough for better reliability
            video.addEventListener('canplaythrough', playVideo, { once: true });
            // Fallback to loadeddata if canplaythrough doesn't fire
            video.addEventListener('loadeddata', () => {
                if (video.paused) {
                    playVideo();
                }
            }, { once: true });
        }
    };
    
    // Start playback after source is loaded
    startVideoPlayback();
    
    // Also handle resize events to switch videos if needed (optional - for orientation changes)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentIsMobile = window.innerWidth <= 768;
            const wasMobile = isMobile;
            
            // Only switch if device type actually changed (e.g., tablet rotation)
            if (currentIsMobile !== wasMobile) {
                console.log('Device type changed, switching video...');
                if (currentIsMobile && mobileSource) {
                    video.src = mobileSource.src;
                } else if (desktopSource) {
                    video.src = desktopSource.src;
                }
                video.load();
                startVideoPlayback();
            }
        }, 300);
    });
    
    // Mark user interaction for pause prevention
    document.addEventListener('click', markInteraction, { once: true });
    document.addEventListener('touchstart', markInteraction, { once: true });
    
    // Prevent video from being paused (only after user interaction)
    video.addEventListener('pause', () => {
        // Only try to resume if user has interacted and video is not ended
        if (userHasInteracted && !video.ended) {
            setTimeout(() => {
                if (video.paused && !video.ended) {
                    video.play().catch(err => {
                        // Silently fail - video might be paused by browser
                        console.log('Auto-resume skipped');
                    });
                }
            }, 100);
        }
    });
    
    // Ensure video restarts if it ends (extra safety for loop)
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play();
    });
    
    // Handle video loading errors
    video.addEventListener('error', (e) => {
        console.warn('Video failed to load. Make sure video.mp4 exists in the project folder.', e);
    });
    
    // Ensure video stays fullscreen on resize
    window.addEventListener('resize', () => {
        video.style.width = '100%';
        video.style.height = '100%';
    });
    
    // Prevent right-click context menu on video
    video.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
}

// Initialize sound button
function initSoundButton() {
    const soundButton = document.getElementById('soundButton');
    const video = document.getElementById('backgroundVideo');
    if (!soundButton || !video) return;
    
    // Update button state based on video mute status
    const updateSoundButton = () => {
        const icon = soundButton.querySelector('.sound-button-icon');
        const text = soundButton.querySelector('.sound-button-text');
        
        if (video.muted) {
            icon.textContent = '🔇';
            text.textContent = 'Միացրու ձայնը';
            soundButton.classList.remove('enabled');
        } else {
            icon.textContent = '🔊';
            text.textContent = 'Ձայնը միացված է';
            soundButton.classList.add('enabled');
        }
    };
    
    soundButton.addEventListener('click', async (e) => {
        // Prevent event bubbling
        e.stopPropagation();
        e.preventDefault();
        
        try {
            if (video.muted) {
                // On mobile, we need to ensure video is playing before unmuting
                if (video.paused) {
                    // Try to play the video first
                    await video.play();
                }
                
                // Now unmute - this must happen in the same user interaction
                video.muted = false;
                
                // Ensure video continues playing
                if (video.paused) {
                    await video.play();
                }
                
                updateSoundButton();
                console.log('Sound enabled via button');
            } else {
                video.muted = true;
                updateSoundButton();
                console.log('Sound muted via button');
            }
        } catch (error) {
            console.log('Sound toggle error:', error);
            // If unmuting fails, at least try to play the video
            if (video.paused) {
                try {
                    await video.play();
                } catch (playError) {
                    console.log('Video play error:', playError);
                }
            }
        }
    });
    
    // Also handle touch events for better mobile support
    soundButton.addEventListener('touchend', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        try {
            if (video.muted) {
                if (video.paused) {
                    await video.play();
                }
                video.muted = false;
                if (video.paused) {
                    await video.play();
                }
                updateSoundButton();
                console.log('Sound enabled via button (touch)');
            } else {
                video.muted = true;
                updateSoundButton();
                console.log('Sound muted via button (touch)');
            }
        } catch (error) {
            console.log('Sound toggle error (touch):', error);
        }
    });
    
    // Listen for mute changes from other sources
    video.addEventListener('volumechange', updateSoundButton);
    
    // Initial state
    updateSoundButton();
}

// Initialize video quest button
function initVideoQuestButton() {
    const questButton = document.getElementById('videoQuestButton');
    if (!questButton) return;
    
    questButton.addEventListener('click', async () => {
        // Send Telegram notification
        sendTelegramNotification('quest_button_clicked');
        
        // Hide the button
        questButton.style.opacity = '0';
        questButton.style.pointerEvents = 'none';
        questButton.style.transform = 'translateX(-50%) scale(0.8)';
        
        // Also enable sound when quest button is clicked
        // const video = document.getElementById('backgroundVideo');
        // if (video && video.muted) {
        //     try {
        //         // Ensure video is playing before unmuting (mobile requirement)
        //         if (video.paused) {
        //             await video.play();
        //         }
        //         video.muted = false;
        //         if (video.paused) {
        //             await video.play();
        //         }
        //         console.log('Sound enabled via quest button');
        //     } catch (error) {
        //         console.log('Quest button sound enable error:', error);
        //     }
        // }
        
        // Create particle effect before showing quest
        createQuestParticles();
        
        // Open quest system
        setTimeout(() => {
            initQuestSystem();
        }, 300);
    });
    
    // Also handle touch events for mobile
    questButton.addEventListener('touchend', async (e) => {
        e.preventDefault();
        
        // Send Telegram notification
        sendTelegramNotification('quest_button_clicked');
        
        // Hide the button
        questButton.style.opacity = '0';
        questButton.style.pointerEvents = 'none';
        questButton.style.transform = 'translateX(-50%) scale(0.8)';
        
        // Also enable sound when quest button is clicked
        const video = document.getElementById('backgroundVideo');
        if (video && video.muted) {
            try {
                if (video.paused) {
                    await video.play();
                }
                video.muted = false;
                if (video.paused) {
                    await video.play();
                }
                console.log('Sound enabled via quest button (touch)');
            } catch (error) {
                console.log('Quest button sound enable error (touch):', error);
            }
        }
        
        // Create particle effect before showing quest
        createQuestParticles();
        
        // Open quest system
        setTimeout(() => {
            initQuestSystem();
        }, 300);
    });
}

// Create animated snowflakes
function initSnow() {
    const snowContainer = document.querySelector('.snow-container');
    const snowflakeCount = 50;
    
    for (let i = 0; i < snowflakeCount; i++) {
        createSnowflake(snowContainer);
    }
}

function createSnowflake(container) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    
    // Random position
    snowflake.style.left = Math.random() * 100 + '%';
    
    // Random size
    const size = Math.random() * 0.8 + 0.4; // 0.4em to 1.2em
    snowflake.style.fontSize = size + 'em';
    
    // Random animation duration (slower = bigger)
    const duration = Math.random() * 10 + 10; // 10s to 20s
    snowflake.style.animationDuration = duration + 's';
    
    // Random delay
    snowflake.style.animationDelay = Math.random() * 5 + 's';
    
    // Random opacity
    snowflake.style.opacity = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    
    container.appendChild(snowflake);
    snowflakes.push(snowflake);
    
    // Remove and recreate snowflake when it falls off screen
    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.remove();
            createSnowflake(container);
        }
    }, duration * 1000);
}

// Initialize quest system
function initQuestSystem() {
    const questContainer = document.getElementById('questContainer');
    const questStepsContainer = document.getElementById('questSteps');
    
    // Create quest steps UI with staggered animation
    QUEST_STEPS.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'quest-step';
        stepElement.id = `questStep${index}`;
        stepElement.style.setProperty('--step-index', index);
        stepElement.innerHTML = `
            <div class="quest-step-icon">${step.icon}</div>
            <div class="quest-step-text">
                <div class="quest-step-main-text">${step.text}</div>
                <div class="quest-step-hint">${step.hint}</div>
            </div>
            <div class="quest-step-check">✓</div>
        `;
        questStepsContainer.appendChild(stepElement);
    });
    
    // Hide all minigames first
    hideAllMinigames();
    
    // Show quest container
    questContainer.classList.add('visible');
    
    // Prevent auto-scroll - ensure quest card starts at top
    const questCard = questContainer.querySelector('.quest-card');
    if (questCard) {
        questCard.scrollTop = 0;
        // Prevent focus from causing scroll
        questCard.addEventListener('focus', (e) => {
            e.preventDefault();
        }, true);
        // Prevent any child elements from causing scroll
        questCard.addEventListener('focusin', (e) => {
            e.preventDefault();
            questCard.scrollTop = 0;
        }, true);
    }
    
    // Activate first step
    activateQuestStep(0);
    
    // Create hidden interactive elements
    createHiddenElements();
}

// Activate a quest step
function activateQuestStep(stepIndex) {
    if (stepIndex >= QUEST_STEPS.length) return;
    
    questState.currentStep = stepIndex;
    const questStep = QUEST_STEPS[stepIndex];
    
    // Update step UI
    const allSteps = document.querySelectorAll('.quest-step');
    allSteps.forEach((step, index) => {
        step.classList.remove('active');
        if (index === stepIndex) {
            step.classList.add('active');
        }
    });
    
    // Remove previous guide arrow if exists
    const existingArrow = document.querySelector('.quest-guide-arrow');
    if (existingArrow) {
        existingArrow.remove();
    }
    
    // Hide all minigames first
    hideAllMinigames();
    
    // Handle different quest types
    if (questStep.type === 'search') {
        // Quest 1: Search for hidden star
        document.body.classList.add('quest-search-mode');
        showQuestContainer();
        
        if (questState.hiddenElements[stepIndex]) {
            const element = questState.hiddenElements[stepIndex];
            element.classList.add('visible');
            createGuideArrow(element, stepIndex);
        }
    } else if (questStep.type === 'pattern') {
        // Quest 2: Pattern matching
        document.body.classList.remove('quest-search-mode');
        hideAllMinigames();
        hideQuestContainer();
        initPatternGame();
    } else if (questStep.type === 'memory') {
        // Quest 3: Memory game
        document.body.classList.remove('quest-search-mode');
        hideAllMinigames();
        hideQuestContainer();
        initMemoryGame();
    } else if (questStep.type === 'counting') {
        // Quest 4: Counting challenge
        document.body.classList.remove('quest-search-mode');
        hideAllMinigames();
        hideQuestContainer();
        initCountingGame();
    }
    
    console.log(`Quest step ${stepIndex} (${questStep.type}) activated`);
}

// Create animated arrow pointing to hidden element
function createGuideArrow(element, stepIndex) {
    const arrow = document.createElement('div');
    arrow.className = 'quest-guide-arrow';
    arrow.innerHTML = '👉';
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const positions = [
        { top: '8%', left: '50%', arrowPos: { top: '5%', left: '50%', rotate: '0deg' } },      // Top center
        { top: '50%', right: '8%', arrowPos: { top: '50%', right: '5%', rotate: '-90deg' } }, // Right side
        { bottom: '8%', left: '50%', arrowPos: { bottom: '5%', left: '50%', rotate: '180deg' } }, // Bottom center
        { top: '50%', left: '8%', arrowPos: { top: '50%', left: '5%', rotate: '90deg' } }     // Left side
    ];
    
    const arrowPos = positions[stepIndex].arrowPos;
    Object.assign(arrow.style, arrowPos);
    if (arrowPos.rotate) {
        arrow.style.transform = `rotate(${arrowPos.rotate})`;
    }
    
    document.body.appendChild(arrow);
    
    // Remove arrow when element is found
    setTimeout(() => {
        const checkInterval = setInterval(() => {
            if (element.classList.contains('found') || !element.classList.contains('visible')) {
                if (arrow.parentNode) {
                    arrow.remove();
                }
                clearInterval(checkInterval);
            }
        }, 100);
    }, 100);
}

// Create hidden interactive elements - only for quest 1 (search type)
function createHiddenElements() {
    const container = document.getElementById('hiddenElementsContainer');
    
    // Only create element for the first quest (search type)
    QUEST_STEPS.forEach((step, index) => {
        if (step.type === 'search') {
            const element = document.createElement('div');
            element.className = 'hidden-element';
            element.innerHTML = step.icon;
            element.dataset.stepIndex = index;
            element.title = 'Կտտացրու ինձ!'; // Hint tooltip
            
            // Position and styling handled by CSS - no inline styles
            // Add multiple event handlers to ensure click works
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Element ${index} clicked!`);
                completeQuestStep(index);
            });
            
            element.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            
            element.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log(`Element ${index} touched!`);
                completeQuestStep(index);
            });
            
            container.appendChild(element);
            questState.hiddenElements[index] = element;
            console.log(`Created hidden element ${index} for search quest`);
        } else {
            // Reserve space for other quest types
            questState.hiddenElements[index] = null;
        }
    });
    
    console.log(`Hidden elements created for search quest only`);
}

// Complete a quest step
function completeQuestStep(stepIndex) {
    if (questState.completedSteps.includes(stepIndex)) return;
    if (stepIndex !== questState.currentStep) return;
    
    const questStep = QUEST_STEPS[stepIndex];
    
    // Mark as completed
    questState.completedSteps.push(stepIndex);
    
    // Update UI
    const stepElement = document.getElementById(`questStep${stepIndex}`);
    if (stepElement) {
        stepElement.classList.remove('active');
        stepElement.classList.add('completed');
    }
    
    // Handle different quest types cleanup
    if (questStep.type === 'search') {
        document.body.classList.remove('quest-search-mode');
        const hiddenElement = questState.hiddenElements[stepIndex];
        if (hiddenElement) {
            hiddenElement.classList.add('found');
            setTimeout(() => {
                hiddenElement.remove();
            }, 600);
        }
    } else if (questStep.type === 'pattern') {
        hideMinigame('questPatternGame');
    } else if (questStep.type === 'memory') {
        hideMinigame('questMemoryGame');
    } else if (questStep.type === 'counting') {
        hideMinigame('questCountingGame');
    }
    
    // Show achievement popup
    showAchievement(ACHIEVEMENT_MESSAGES[stepIndex]);
    
    // Update progress
    updateQuestProgress();
    
    // Send Telegram notification for quest step completion
    sendTelegramNotification('quest_step_completed', { stepIndex: stepIndex });
    
    // Move to next step or complete quest
    if (questState.completedSteps.length < QUEST_STEPS.length) {
        setTimeout(() => {
            activateQuestStep(questState.currentStep + 1);
        }, 1500);
    } else {
        // Quest completed!
        setTimeout(() => {
            completeQuest();
        }, 2000);
    }
}

// Update quest progress bar
function updateQuestProgress() {
    const progress = (questState.completedSteps.length / QUEST_STEPS.length) * 100;
    const progressFill = document.getElementById('questProgressFill');
    const progressText = document.getElementById('questProgressText');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${questState.completedSteps.length}/${QUEST_STEPS.length}`;
    }
}

// Show achievement popup
function showAchievement(message) {
    const popup = document.getElementById('achievementPopup');
    const text = document.getElementById('achievementText');
    
    if (text) {
        text.textContent = message;
    }
    
    if (popup) {
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 2000);
    }
}

// Complete quest and show final message
function completeQuest() {
    // Send Telegram notification for all quests completed
    sendTelegramNotification('all_quests_completed');
    
    const questContainer = document.getElementById('questContainer');
    const messageContainer = document.getElementById('messageContainer');
    
    // Hide quest
    questContainer.classList.remove('visible');
    
    // Show final confetti
    createConfetti();
    
    // Show message container
    setTimeout(() => {
        messageContainer.classList.add('visible');
        startTypewriterEffect();
    }, 500);
}

// Create particle effect for quest appearance
function createQuestParticles() {
    const questContainer = document.getElementById('questContainer');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.borderRadius = '50%';
            particle.style.background = ['#ffd700', '#ffed4e', '#fff', '#ff6b6b'][Math.floor(Math.random() * 4)];
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '19';
            particle.style.boxShadow = '0 0 10px currentColor';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 200 + Math.random() * 100;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            particle.style.opacity = '1';
            particle.style.transition = 'all 1s ease-out';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.style.opacity = '0';
                particle.style.transform = `translate(-50%, -50%) translate(${x * 1.5}px, ${y * 1.5}px) scale(0)`;
                setTimeout(() => particle.remove(), 1000);
            }, 100);
        }, i * 20);
    }
}

// Create confetti animation
function createConfetti() {
    const confettiContainer = document.getElementById('confettiContainer');
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random horizontal position
            confetti.style.left = Math.random() * 100 + '%';
            
            // Random size
            const size = Math.random() * 8 + 6; // 6px to 14px
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            // Random shape (circle or square)
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }
            
            // Random animation duration
            const duration = Math.random() * 2 + 3; // 3s to 5s
            confetti.style.animationDuration = duration + 's';
            
            // Random delay
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            confettiContainer.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, duration * 1000);
        }, i * 20); // Stagger confetti creation
    }
}

// Typewriter effect for messages with staggered sections
function startTypewriterEffect() {
    const messageMain = document.getElementById('messageMain');
    const messageAdditional = document.getElementById('messageAdditional');
    const messageSignature = document.getElementById('messageSignature');
    const messageContainer = document.getElementById('messageContainer');
    
    // Start scroll at top
    if (messageContainer) {
        messageContainer.scrollTop = 0;
    }
    
    // Start with main message
    typeText(messageMain, CONGRATULATION_MESSAGE, () => {
        messageMain.classList.add('complete');
        
        // Scroll to show additional message area
        if (messageContainer) {
            setTimeout(() => {
                messageContainer.scrollTo({
                    top: messageContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
        
        // After main message, show additional message if provided
        if (ADDITIONAL_MESSAGE && ADDITIONAL_MESSAGE.trim() !== '') {
            setTimeout(() => {
                messageAdditional.classList.add('visible');
                typeText(messageAdditional, ADDITIONAL_MESSAGE, () => {
                    messageAdditional.classList.add('complete');
                    
                    // Scroll to show signature area
                    if (messageContainer) {
                        setTimeout(() => {
                            messageContainer.scrollTo({
                                top: messageContainer.scrollHeight,
                                behavior: 'smooth'
                            });
                        }, 100);
                    }
                    
                    // After additional message, show signature if provided
                    if (SIGNATURE_MESSAGE && SIGNATURE_MESSAGE.trim() !== '') {
                        setTimeout(() => {
                            messageSignature.classList.add('visible');
                            typeText(messageSignature, SIGNATURE_MESSAGE, () => {
                                messageSignature.classList.add('complete');
                                
                                // Final scroll to bottom
                                if (messageContainer) {
                                    setTimeout(() => {
                                        messageContainer.scrollTo({
                                            top: messageContainer.scrollHeight,
                                            behavior: 'smooth'
                                        });
                                    }, 100);
                                }
                            });
                        }, 500);
                    }
                });
            }, 800);
        } else if (SIGNATURE_MESSAGE && SIGNATURE_MESSAGE.trim() !== '') {
            // If no additional message, go straight to signature
            setTimeout(() => {
                messageSignature.classList.add('visible');
                typeText(messageSignature, SIGNATURE_MESSAGE, () => {
                    messageSignature.classList.add('complete');
                    
                    // Final scroll to bottom
                    if (messageContainer) {
                        setTimeout(() => {
                            messageContainer.scrollTo({
                                top: messageContainer.scrollHeight,
                                behavior: 'smooth'
                            });
                        }, 100);
                    }
                });
            }, 800);
        }
    });
}

// Generic typewriter function
function typeText(element, text, onComplete) {
    let index = 0;
    element.textContent = '';
    element.style.whiteSpace = 'pre-line'; // Allow line breaks
    
    // Get message container for auto-scrolling
    const messageContainer = document.getElementById('messageContainer');
    
    // Auto-scroll function
    function autoScroll() {
        if (messageContainer) {
            // Scroll to bottom smoothly - scroll the container itself
            const scrollHeight = messageContainer.scrollHeight;
            const clientHeight = messageContainer.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            
            // Smooth scroll to bottom
            messageContainer.scrollTo({
                top: maxScroll,
                behavior: 'smooth'
            });
        }
    }
    
    function typeCharacter() {
        if (index < text.length) {
            // Handle emoji and special characters
            const char = text[index];
            element.textContent += char;
            index++;
            
            // Auto-scroll every few characters or on line breaks
            if (char === '\n' || index % 10 === 0) {
                // Small delay to let DOM update
                setTimeout(autoScroll, 10);
            }
            
            // Variable delay for more natural typing
            let delay;
            if (char === '\n') {
                delay = 200; // Longer pause for line breaks
                // Scroll after line break
                setTimeout(autoScroll, 50);
            } else if (char === ' ') {
                delay = 100;
            } else {
                delay = Math.random() * 50 + 30; // 30-80ms
            }
            setTimeout(typeCharacter, delay);
        } else {
            // Typing complete - scroll to bottom one final time
            setTimeout(autoScroll, 100);
            
            if (onComplete) {
                onComplete();
            }
        }
    }
    
    typeCharacter();
}

// Get user IP address (using free IP API)
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'Unknown';
    } catch (error) {
        console.log('Could not fetch IP:', error);
        return 'Unknown';
    }
}

// Send Telegram notification with event tracking
async function sendTelegramNotification(eventType, additionalData = {}) {
    // Skip if API URL is not configured
    if (!TELEGRAM_API_URL || TELEGRAM_API_URL.includes('your-serverless-function')) {
        console.log('Telegram API URL not configured. Skipping notification.');
        return;
    }

    try {
        // Get IP if not already fetched
        if (!telegramTracking.userIP && eventType === 'page_load') {
            telegramTracking.userIP = await getUserIP();
        }

        // Calculate time spent (for page_load and page_unload events)
        const timeSpent = eventType === 'page_unload' 
            ? Math.floor((Date.now() - telegramTracking.pageLoadTime) / 1000) // seconds
            : null;

        // Prepare message based on event type
        let message = '';
        let eventData = {
            eventType: eventType,
            timestamp: new Date().toISOString(),
            ...additionalData
        };

        switch (eventType) {
            case 'page_load':
                message = `🎄 Նոր Տարի 2026 - Կայք բացված\n\n`;
                message += `📱 IP հասցե: ${telegramTracking.userIP}\n`;
                message += `🖥️ Էկրան: ${telegramTracking.screenSize}\n`;
                message += `🌐 Բրաուզեր: ${navigator.userAgent.split(' ')[0]}\n`;
                message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}`;
                eventData.ip = telegramTracking.userIP;
                eventData.screenSize = telegramTracking.screenSize;
                eventData.userAgent = telegramTracking.userAgent;
                break;

            case 'quest_button_clicked':
                message = `🎁 Քվեստի կոճակ սեղմված\n\n`;
                message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}\n`;
                message += `📱 IP: ${telegramTracking.userIP || 'Loading...'}`;
                telegramTracking.questButtonClicked = true;
                break;

            case 'quest_step_completed':
                const stepNumber = additionalData.stepIndex + 1;
                const stepName = QUEST_STEPS[additionalData.stepIndex]?.text || `Քայլ ${stepNumber}`;
                message = `✅ Քվեստի քայլ ավարտված\n\n`;
                message += `📋 Քայլ ${stepNumber}: ${stepName}\n`;
                message += `📊 Առաջընթաց: ${questState.completedSteps.length}/${QUEST_STEPS.length}\n`;
                message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}`;
                telegramTracking.questStepsCompleted.push(stepNumber);
                eventData.stepName = stepName;
                eventData.progress = `${questState.completedSteps.length}/${QUEST_STEPS.length}`;
                break;

            case 'all_quests_completed':
                const totalTime = Math.floor((Date.now() - telegramTracking.pageLoadTime) / 1000);
                const minutes = Math.floor(totalTime / 60);
                const seconds = totalTime % 60;
                message = `🎉 Բոլոր քվեստները ավարտված!\n\n`;
                message += `⏱️ Ընդհանուր ժամանակ: ${minutes} րոպե ${seconds} վայրկյան\n`;
                message += `📊 Ավարտված քայլեր: ${questState.completedSteps.length}/${QUEST_STEPS.length}\n`;
                message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}\n`;
                message += `📱 IP: ${telegramTracking.userIP || 'Unknown'}`;
                telegramTracking.allQuestsCompleted = true;
                eventData.totalTimeSeconds = totalTime;
                eventData.totalTimeFormatted = `${minutes} րոպե ${seconds} վայրկյան`;
                break;

            case 'message_opened':
                const timeToMessage = telegramTracking.messageOpenTime 
                    ? Math.floor((telegramTracking.messageOpenTime - telegramTracking.pageLoadTime) / 1000)
                    : 0;
                const msgMinutes = Math.floor(timeToMessage / 60);
                const msgSeconds = timeToMessage % 60;
                message = `📖 Հաղորդագրությունը բացված\n\n`;
                message += `⏱️ Քվեստից մինչև հաղորդագրություն: ${msgMinutes} րոպե ${msgSeconds} վայրկյան\n`;
                message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}`;
                eventData.timeToMessageSeconds = timeToMessage;
                eventData.timeToMessageFormatted = `${msgMinutes} րոպե ${msgSeconds} վայրկյան`;
                break;

            case 'page_unload':
                if (timeSpent !== null) {
                    const minutes = Math.floor(timeSpent / 60);
                    const seconds = timeSpent % 60;
                    
                    // Calculate time spent reading message
                    let messageReadTime = 0;
                    let messageReadTimeFormatted = '0 վայրկյան';
                    if (telegramTracking.messageOpenTime) {
                        messageReadTime = Math.floor((Date.now() - telegramTracking.messageOpenTime) / 1000);
                        const readMinutes = Math.floor(messageReadTime / 60);
                        const readSeconds = messageReadTime % 60;
                        messageReadTimeFormatted = `${readMinutes} րոպե ${readSeconds} վայրկյան`;
                    }
                    
                    // Determine if user read the message
                    const readPercentage = telegramTracking.maxScrollPercentage;
                    let readStatus = 'Ոչ';
                    if (readPercentage >= 80) {
                        readStatus = 'Ամբողջությամբ կարդացված ✅';
                    } else if (readPercentage >= 50) {
                        readStatus = 'Մասամբ կարդացված 📖';
                    } else if (readPercentage > 0) {
                        readStatus = 'Սկսել է կարդալ 📄';
                    } else if (telegramTracking.messageOpened) {
                        readStatus = 'Բացված, բայց չի կարդացել ❌';
                    }
                    
                    message = `👋 Օգտատերը լքեց կայքը\n\n`;
                    message += `⏱️ Կայքում անցկացրած ժամանակ: ${minutes} րոպե ${seconds} վայրկյան\n`;
                    message += `🎁 Քվեստի կոճակ սեղմված: ${telegramTracking.questButtonClicked ? 'Այո' : 'Ոչ'}\n`;
                    message += `✅ Ավարտված քայլեր: ${telegramTracking.questStepsCompleted.length}/${QUEST_STEPS.length}\n`;
                    message += `🎉 Բոլոր քվեստները ավարտված: ${telegramTracking.allQuestsCompleted ? 'Այո' : 'Ոչ'}\n`;
                    message += `📖 Հաղորդագրությունը բացված: ${telegramTracking.messageOpened ? 'Այո' : 'Ոչ'}\n`;
                    
                    if (telegramTracking.messageOpened) {
                        message += `📚 Կարդալու ժամանակ: ${messageReadTimeFormatted}\n`;
                        message += `📊 Կարդալու տոկոս: ${readPercentage}%\n`;
                        message += `📝 Կարդալու կարգավիճակ: ${readStatus}\n`;
                    }
                    
                    message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}`;
                    
                    eventData.timeSpentSeconds = timeSpent;
                    eventData.timeSpentFormatted = `${minutes} րոպե ${seconds} վայրկյան`;
                    eventData.questButtonClicked = telegramTracking.questButtonClicked;
                    eventData.questStepsCompleted = telegramTracking.questStepsCompleted.length;
                    eventData.allQuestsCompleted = telegramTracking.allQuestsCompleted;
                    eventData.messageOpened = telegramTracking.messageOpened;
                    eventData.messageReadTimeSeconds = messageReadTime;
                    eventData.messageReadTimeFormatted = messageReadTimeFormatted;
                    eventData.scrollPercentage = readPercentage;
                    eventData.readStatus = readStatus;
                }
                break;

            default:
                message = `📢 Իրադարձություն: ${eventType}\n\n`;
                message += `⏰ Ժամանակ: ${new Date().toLocaleString('hy-AM')}`;
        }

        // Send to serverless function
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                ...eventData
            }),
        });

        if (!response.ok) {
            console.error('Telegram notification failed:', response.status);
        }
    } catch (error) {
        // Fail silently - don't interrupt user experience
        console.log('Telegram notification error (silent):', error.message);
    }
}

// ========== QUEST GAME FUNCTIONS ==========

function hideAllMinigames() {
    const minigames = ['questPatternGame', 'questMemoryGame', 'questCountingGame'];
    minigames.forEach(gameId => {
        const game = document.getElementById(gameId);
        if (game) {
            game.classList.remove('visible');
        }
    });
}

function hideMinigame(gameId) {
    const game = document.getElementById(gameId);
    if (game) {
        game.classList.remove('visible');
    }
    // Show quest container again when minigame is hidden
    showQuestContainer();
}

function hideQuestContainer() {
    const questContainer = document.getElementById('questContainer');
    if (questContainer) {
        questContainer.classList.remove('visible');
    }
}

function showQuestContainer() {
    const questContainer = document.getElementById('questContainer');
    if (questContainer) {
        questContainer.classList.add('visible');
    }
}

// Quest 2: Pattern Matching Game
function initPatternGame() {
    const gameContainer = document.getElementById('questPatternGame');
    const buttonsContainer = document.getElementById('patternButtons');
    const sequenceContainer = document.getElementById('patternSequence');
    
    // Generate random sequence
    const icons = ['⭐', '✨', '🎁', '🎄'];
    questGameState.patternSequence = [];
    questGameState.patternUserInput = [];
    
    // Create sequence of 4 icons
    for (let i = 0; i < 4; i++) {
        questGameState.patternSequence.push(icons[Math.floor(Math.random() * icons.length)]);
    }
    
    // Show sequence
    sequenceContainer.innerHTML = '';
    questGameState.patternSequence.forEach((icon, index) => {
        setTimeout(() => {
            const seqItem = document.createElement('div');
            seqItem.className = 'pattern-item';
            seqItem.textContent = icon;
            seqItem.style.animation = 'patternShow 0.5s ease';
            sequenceContainer.appendChild(seqItem);
        }, index * 500);
    });
    
    // Create buttons
    buttonsContainer.innerHTML = '';
    icons.forEach((icon) => {
        const button = document.createElement('button');
        button.className = 'pattern-btn';
        button.textContent = icon;
        button.addEventListener('click', (e) => {
            // Add visual feedback on click
            button.classList.add('pattern-btn-clicked');
            setTimeout(() => {
                button.classList.remove('pattern-btn-clicked');
            }, 300);
            handlePatternClick(icon);
        });
        buttonsContainer.appendChild(button);
    });
    
    // Show game after sequence
    setTimeout(() => {
        gameContainer.classList.add('visible');
    }, 2500);
}

function handlePatternClick(icon) {
    questGameState.patternUserInput.push(icon);
    
    // Check if correct
    if (questGameState.patternUserInput.length === questGameState.patternSequence.length) {
        const isCorrect = questGameState.patternUserInput.every((val, idx) => 
            val === questGameState.patternSequence[idx]
        );
        
        if (isCorrect) {
            completeQuestStep(1);
        } else {
            // Reset
            questGameState.patternUserInput = [];
            showAchievement('Սխալ է, փորձիր նորից!');
            setTimeout(() => {
                initPatternGame();
            }, 1000);
        }
    }
}

// Quest 3: Memory Game
function initMemoryGame() {
    const gameContainer = document.getElementById('questMemoryGame');
    const gridContainer = document.getElementById('memoryGrid');
    
    const icons = ['⭐', '✨', '🎁', '🎄', '🎅', '❄️'];
    const pairs = [...icons, ...icons].sort(() => Math.random() - 0.5);
    
    questGameState.memoryCards = pairs;
    questGameState.memoryFlipped = [];
    questGameState.memoryMatches = 0;
    
    gridContainer.innerHTML = '';
    pairs.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.icon = icon;
        card.innerHTML = '<div class="memory-card-back">?</div>';
        card.addEventListener('click', () => handleMemoryClick(index));
        gridContainer.appendChild(card);
    });
    
    gameContainer.classList.add('visible');
}

function handleMemoryClick(index) {
    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    card.innerHTML = `<div class="memory-card-front">${questGameState.memoryCards[index]}</div>`;
    questGameState.memoryFlipped.push(index);
    
    if (questGameState.memoryFlipped.length === 2) {
        const [idx1, idx2] = questGameState.memoryFlipped;
        if (questGameState.memoryCards[idx1] === questGameState.memoryCards[idx2]) {
            // Match!
            questGameState.memoryMatches++;
            document.querySelector(`.memory-card[data-index="${idx1}"]`).classList.add('matched');
            document.querySelector(`.memory-card[data-index="${idx2}"]`).classList.add('matched');
            
            if (questGameState.memoryMatches === 6) {
                setTimeout(() => completeQuestStep(2), 500);
            }
        } else {
            // No match, flip back
            setTimeout(() => {
                document.querySelector(`.memory-card[data-index="${idx1}"]`).classList.remove('flipped');
                document.querySelector(`.memory-card[data-index="${idx2}"]`).classList.remove('flipped');
                document.querySelector(`.memory-card[data-index="${idx1}"]`).innerHTML = '<div class="memory-card-back">?</div>';
                document.querySelector(`.memory-card[data-index="${idx2}"]`).innerHTML = '<div class="memory-card-back">?</div>';
            }, 1000);
        }
        questGameState.memoryFlipped = [];
    }
}

// Quest 4: Counting Challenge
function initCountingGame() {
    const gameContainer = document.getElementById('questCountingGame');
    const display = document.getElementById('countingDisplay');
    const options = document.getElementById('countingOptions');
    const result = document.getElementById('countingResult');
    
    // Generate random number of stars (5-12)
    const correctCount = Math.floor(Math.random() * 8) + 5;
    questGameState.countingAnswer = correctCount;
    
    // Clear previous and reset display
    display.innerHTML = '';
    display.style.display = 'flex'; // Reset display to show stars again
    display.style.opacity = '1';
    options.innerHTML = '';
    result.innerHTML = '';
    result.className = 'counting-result';
    
    // Show stars briefly
    const stars = [];
    for (let i = 0; i < correctCount; i++) {
        const star = document.createElement('span');
        star.className = 'counting-star';
        star.textContent = '⭐';
        star.style.animationDelay = (i * 0.1) + 's';
        star.style.opacity = '0';
        star.style.transform = 'scale(0)';
        display.appendChild(star);
        stars.push(star);
    }
    
    // Animate stars appearing
    setTimeout(() => {
        stars.forEach(star => {
            star.style.opacity = '1';
            star.style.transform = 'scale(1)';
        });
    }, 100);
    
    // Hide stars after 3 seconds
    setTimeout(() => {
        stars.forEach(star => {
            star.style.opacity = '0';
            star.style.transform = 'scale(0)';
        });
        
        // Show answer options
        setTimeout(() => {
            display.style.display = 'none';
            showCountingOptions();
        }, 500);
    }, 3000);
    
    function showCountingOptions() {
        // Generate 4 options (one correct, three wrong)
        const wrongOptions = [];
        while (wrongOptions.length < 3) {
            const wrong = Math.floor(Math.random() * 8) + 5;
            if (wrong !== correctCount && !wrongOptions.includes(wrong)) {
                wrongOptions.push(wrong);
            }
        }
        
        const allOptions = [correctCount, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        allOptions.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'counting-btn';
            button.textContent = option;
            button.addEventListener('click', () => {
                checkCountingAnswer(option);
            });
            options.appendChild(button);
        });
    }
    
    function checkCountingAnswer(selected) {
        // Disable all buttons
        document.querySelectorAll('.counting-btn').forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.textContent) === selected) {
                if (selected === correctCount) {
                    btn.classList.add('counting-correct');
                    result.textContent = 'Ճիշտ է! 🎉';
                    result.className = 'counting-result counting-success';
                    setTimeout(() => {
                        completeQuestStep(3);
                    }, 1500);
                } else {
                    btn.classList.add('counting-wrong');
                    result.textContent = `Սխալ է! Ճիշտ պատասխանը ${correctCount} էր`;
                    result.className = 'counting-result counting-error';
                    setTimeout(() => {
                        initCountingGame();
                    }, 2000);
                }
            }
        });
    }
    
    gameContainer.classList.add('visible');
}



// Quiz UI Component - Handles quiz display and interaction
const QuizUI = {
    // Initialize quiz UI
    init: function(containerId, language, level) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Quiz container not found');
            return false;
        }
        
        this.language = language;
        this.level = level;
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = [];
        this.quizActive = false;
        
        // Create UI structure
        this.createUIStructure();
        
        return true;
    },
    
    // Create the quiz UI structure
    createUIStructure: function() {
        this.container.innerHTML = `
            <div class="quiz-wrapper">
                <div class="quiz-header">
                    <h3>Personalized Quiz</h3>
                    <div class="quiz-info">
                        <span class="quiz-language">${this.capitalize(this.language)}</span>
                        <span class="quiz-level">Level ${this.level.toUpperCase()}</span>
                    </div>
                </div>
                <div class="quiz-start-screen" id="quizStartScreen">
                    <p>This personalized quiz will test your knowledge based on your learning progress.</p>
                    <button class="btn quiz-start-btn" id="quizStartButton">Start Quiz</button>
                </div>
                <div class="quiz-content" id="quizContent" style="display: none;">
                    <div class="quiz-progress">
                        <div class="progress-text">Question <span id="questionNumber">1</span>/<span id="totalQuestions">5</span></div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="quizProgressBar" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="question-container" id="questionContainer">
                        <!-- Questions will be populated here -->
                    </div>
                    <div class="quiz-actions">
                        <button class="btn quiz-submit-btn" id="quizSubmitButton">Submit Answer</button>
                        <button class="btn quiz-next-btn" id="quizNextButton" style="display: none;">Next Question</button>
                    </div>
                </div>
                <div class="quiz-results" id="quizResults" style="display: none;">
                    <h3>Quiz Complete!</h3>
                    <div class="result-score">
                        You scored <span id="finalScore">0</span>/<span id="maxScore">0</span>
                    </div>
                    <div class="result-feedback" id="resultFeedback"></div>
                    <button class="btn" id="retryQuizButton">Try Again</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        this.addEventListeners();
        
        // Add styling
        this.addStyles();
    },
    
    // Add event listeners for quiz interactions
    addEventListeners: function() {
        const startButton = document.getElementById('quizStartButton');
        const submitButton = document.getElementById('quizSubmitButton');
        const nextButton = document.getElementById('quizNextButton');
        const retryButton = document.getElementById('retryQuizButton');
        
        if (startButton) {
            startButton.addEventListener('click', () => this.startQuiz());
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', () => this.submitAnswer());
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextQuestion());
        }
        
        if (retryButton) {
            retryButton.addEventListener('click', () => this.resetQuiz());
        }
    },
    
    // Add CSS styles for the quiz
    addStyles: function() {
        // Check if styles already exist
        if (document.getElementById('quizStyles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'quizStyles';
          styleEl.innerHTML = `
            .quiz-wrapper {
                background: var(--card-bg, #ffffff);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .quiz-header {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(var(--text-color-rgb, 0, 0, 0), 0.1);
            }
            
            .quiz-header h3 {
                margin: 0 0 10px 0;
                color: var(--primary-color, #4CAF50);
            }
            
            .quiz-info {
                display: flex;
                gap: 15px;
                font-size: 0.9rem;
            }
            
            .quiz-language, .quiz-level {
                background: rgba(var(--primary-color-rgb, 76, 175, 80), 0.1);
                padding: 3px 10px;
                border-radius: 15px;
            }
            
            .personalization-hint, .adaptive-strategy {
                margin: 10px 0;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .personalization-hint {
                background: rgba(var(--primary-color-rgb, 76, 175, 80), 0.05);
                border-left: 3px solid var(--primary-color, #4CAF50);
            }
            
            .adaptive-strategy {
                background: rgba(255, 193, 7, 0.05);
                border-left: 3px solid #FFC107;
            }
            
            .hint-icon, .strategy-icon {
                font-size: 1.1rem;
                min-width: 24px;
                text-align: center;
            }
            
            .question-context {
                margin-top: 10px;
                font-size: 0.9rem;
                color: rgba(var(--text-color-rgb, 0, 0, 0), 0.7);
                padding-left: 10px;
                border-left: 2px solid rgba(var(--text-color-rgb, 0, 0, 0), 0.2);
            }
            
            .quiz-start-screen {
                text-align: center;
                padding: 30px 0;
            }
            
            .quiz-content {
                padding: 10px 0;
            }
            
            .quiz-progress {
                margin-bottom: 20px;
            }
            
            .progress-text {
                font-size: 0.9rem;
                margin-bottom: 5px;
            }
            
            .progress-bar-container {
                height: 8px;
                background: rgba(var(--text-color-rgb, 0, 0, 0), 0.1);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background: var(--secondary-color, #FFC107);
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            .question-container {
                margin-bottom: 20px;
            }
            
            .question-text {
                font-size: 1.1rem;
                margin-bottom: 15px;
                font-weight: 500;
            }
            
            .options-list {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            
            .option-item {
                padding: 12px 15px;
                background: rgba(var(--text-color-rgb, 0, 0, 0), 0.05);
                margin-bottom: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .option-item:hover {
                background: rgba(var(--text-color-rgb, 0, 0, 0), 0.1);
            }
            
            .option-item.selected {
                background: rgba(var(--primary-color-rgb, 76, 175, 80), 0.2);
            }
            
            .option-item.correct {
                background: rgba(76, 175, 80, 0.2);
                border: 1px solid #4CAF50;
            }
            
            .option-item.incorrect {
                background: rgba(244, 67, 54, 0.2);
                border: 1px solid #F44336;
            }
            
            .quiz-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
            }
            
            .quiz-results {
                text-align: center;
                padding: 30px 0;
            }
            
            .result-score {
                font-size: 1.2rem;
                margin: 20px 0;
            }
            
            .result-feedback {
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .feedback-good {
                background: rgba(76, 175, 80, 0.1);
                border: 1px solid #4CAF50;
            }
            
            .feedback-okay {
                background: rgba(255, 193, 7, 0.1);
                border: 1px solid #FFC107;
            }
            
            .feedback-poor {
                background: rgba(244, 67, 54, 0.1);
                border: 1px solid #F44336;
            }
            
            .quiz-timer {
                font-size: 0.9rem;
                text-align: right;
                margin-bottom: 10px;
                color: var(--text-color, #333);
            }
            
            @media (max-width: 768px) {
                .quiz-wrapper {
                    padding: 15px;
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    },
    
    // Start the quiz with personalized questions
    startQuiz: function() {
        // Get personalized questions from QuizManager
        this.questions = QuizManager.generateQuiz(this.language, this.level);
        
        if (!this.questions || this.questions.length === 0) {
            console.error('Failed to generate quiz questions');
            return;
        }
        
        // Set up the UI for questions
        this.currentQuestion = 0;
        this.score = 0;
        this.quizActive = true;
        this.startTime = new Date();
        this.questionData = []; // Store data about each question attempt
        this.isChallenge = this.questions.some(q => q.adaptiveStrategy === 'challenge');
        
        // Update total questions display
        document.getElementById('totalQuestions').textContent = this.questions.length;
        
        // Hide start screen and show quiz content
        document.getElementById('quizStartScreen').style.display = 'none';
        document.getElementById('quizContent').style.display = 'block';
        document.getElementById('quizResults').style.display = 'none';
        
        // Start the timer
        this.startTimer();
        
        // Display first question
        this.displayQuestion(this.currentQuestion);
    },
    
    // Start quiz timer
    startTimer: function() {
        this.questionStartTime = new Date();
        
        // Create timer element if it doesn't exist
        if (!document.getElementById('quizTimer')) {
            const progressContainer = document.querySelector('.quiz-progress');
            const timerElement = document.createElement('div');
            timerElement.id = 'quizTimer';
            timerElement.className = 'quiz-timer';
            timerElement.innerHTML = '00:00';
            progressContainer.appendChild(timerElement);
        }
        
        // Update timer every second
        clearInterval(this.timerInterval); // Clear any existing timer
        this.timerInterval = setInterval(() => {
            const now = new Date();
            const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
            const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
            
            document.getElementById('quizTimer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    },
    
    // Display a specific question
    displayQuestion: function(index) {
        if (index >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const question = this.questions[index];
        const questionContainer = document.getElementById('questionContainer');
        
        // Update question number
        document.getElementById('questionNumber').textContent = index + 1;
        
        // Update progress bar
        const progressPercentage = ((index) / this.questions.length) * 100;
        document.getElementById('quizProgressBar').style.width = `${progressPercentage}%`;
        
        // Prepare personalization hint if available
        let personalizationHint = '';
        if (question.personalizationReason && question.personalizationReason.length > 0) {
            personalizationHint = `
                <div class="personalization-hint">
                    <i class="hint-icon">💡</i> 
                    <span>${question.personalizationReason[0]}</span>
                </div>
            `;
        }
        
        // Check for adaptive strategy messaging
        let adaptiveHint = '';
        if (question.adaptiveStrategy) {
            let strategyMessage = '';
            switch (question.adaptiveStrategy) {
                case 'challenge':
                    strategyMessage = 'Challenge mode: Testing your advanced skills';
                    break;
                case 'reinforce':
                    strategyMessage = 'Reinforcement mode: Building your foundations';
                    break;
                default:
                    // Don't show a hint for balanced strategy
                    break;
            }
            
            if (strategyMessage) {
                adaptiveHint = `
                    <div class="adaptive-strategy">
                        <i class="strategy-icon">🎯</i>
                        <span>${strategyMessage}</span>
                    </div>
                `;
            }
        }
        
        // Create question HTML with personalization
        questionContainer.innerHTML = `
            <div class="question-text">${question.question}</div>
            ${personalizationHint}
            ${adaptiveHint}
            <ul class="options-list" id="optionsList">
                ${question.options.map((option, i) => `
                    <li class="option-item" data-index="${i}">${option}</li>
                `).join('')}
            </ul>
            ${question.context ? `<div class="question-context"><i>Context: ${question.context}</i></div>` : ''}
            <div class="feedback" id="questionFeedback" style="display: none;"></div>
        `;
        
        // Add event listeners to options
        const optionItems = questionContainer.querySelectorAll('.option-item');
        optionItems.forEach(item => {
            item.addEventListener('click', () => {
                // Deselect all options
                optionItems.forEach(opt => opt.classList.remove('selected'));
                // Select clicked option
                item.classList.add('selected');
                // Enable submit button
                document.getElementById('quizSubmitButton').disabled = false;
            });
        });
        
        // Reset button states
        document.getElementById('quizSubmitButton').style.display = 'block';
        document.getElementById('quizNextButton').style.display = 'none';
    },
    
    // Submit and check answer
    submitAnswer: function() {
        if (!this.quizActive) return;
        
        const selectedOption = document.querySelector('.option-item.selected');
        if (!selectedOption) {
            alert('Please select an answer');
            return;
        }
        
        const selectedIndex = parseInt(selectedOption.dataset.index);
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // Calculate time spent on this question
        const questionEndTime = new Date();
        const questionDuration = (questionEndTime - this.questionStartTime) / 1000; // in seconds
        
        // Store question attempt data
        this.questionData.push({
            questionId: question.id,
            isCorrect: isCorrect,
            timeTaken: questionDuration,
            userAnswer: selectedIndex,
            difficulty: question.difficulty,
            topics: question.topics || []
        });
          // Record this attempt
        if (QuizManager.recordQuestionAttempt) {
            QuizManager.recordQuestionAttempt(this.language, question.id, isCorrect);
        }
        
        // Record this attempt in tracking system for personalization
        if (UserTracking && UserTracking.updateQuestionHistory) {
            UserTracking.updateQuestionHistory(
                this.language, 
                this.level, 
                question.id, 
                isCorrect, 
                Math.round(questionDuration)
            );
        }
        
        // Update score if correct
        if (isCorrect) {
            this.score++;
        }
        
        // Show feedback
        const optionItems = document.querySelectorAll('.option-item');
        
        // Highlight correct and incorrect answers
        optionItems.forEach((item, index) => {
            if (index === question.correctAnswer) {
                item.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                item.classList.add('incorrect');
            }
            
            // Disable clicking options
            item.style.pointerEvents = 'none';
        });
        
        // Show feedback text
        const feedbackEl = document.getElementById('questionFeedback');
        feedbackEl.style.display = 'block';
        
        if (isCorrect) {
            feedbackEl.innerHTML = `<div class="feedback-correct">Correct! Well done.</div>`;
        } else {
            feedbackEl.innerHTML = `<div class="feedback-incorrect">Incorrect. The correct answer is: ${question.options[question.correctAnswer]}</div>`;
        }
        
        // Switch buttons
        document.getElementById('quizSubmitButton').style.display = 'none';
        document.getElementById('quizNextButton').style.display = 'block';
    },
    
    // Move to next question
    nextQuestion: function() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.questions.length) {
            this.showResults();
        } else {
            this.displayQuestion(this.currentQuestion);
        }
    },
    
    // Show quiz results
    showResults: function() {
        this.quizActive = false;
        clearInterval(this.timerInterval); // Stop the timer
        
        // Calculate total quiz duration
        const endTime = new Date();
        const totalDuration = Math.floor((endTime - this.startTime) / 1000); // in seconds
        
        // Hide quiz content and show results
        document.getElementById('quizContent').style.display = 'none';
        document.getElementById('quizResults').style.display = 'block';
        
        // Update final score display
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('maxScore').textContent = this.questions.length;
        
        // Update progress bar to 100%
        document.getElementById('quizProgressBar').style.width = '100%';
        
        // Show feedback based on score
        const resultFeedback = document.getElementById('resultFeedback');
        const scorePercentage = (this.score / this.questions.length) * 100;
        
        let feedbackClass, feedbackText;
        
        if (scorePercentage >= 80) {
            feedbackClass = 'feedback-good';
            feedbackText = 'Excellent! You have a strong understanding of this material.';
        } else if (scorePercentage >= 50) {
            feedbackClass = 'feedback-okay';
            feedbackText = 'Good effort! Keep practicing to improve your skills.';
        } else {
            feedbackClass = 'feedback-poor';
            feedbackText = 'Keep working on this material to improve your understanding.';
        }
        
        resultFeedback.className = `result-feedback ${feedbackClass}`;
        resultFeedback.textContent = feedbackText;
        
        // Add time taken to the results
        const minutes = Math.floor(totalDuration / 60);
        const seconds = totalDuration % 60;
        const timeText = document.createElement('div');
        timeText.className = 'time-taken';
        timeText.textContent = `Time taken: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        resultFeedback.after(timeText);
        
        // Record quiz completion in UserTracking
        if (typeof UserTracking !== 'undefined' && UserTracking.saveQuizResult) {
            // Create a comprehensive quiz result object
            const quizResult = {
                language: this.language,
                level: this.level,
                score: this.score,
                totalQuestions: this.questions.length,
                duration: totalDuration,
                date: new Date().toISOString(),
                wasChallenge: this.isChallenge,
                questions: this.questionData
            };
            
            // Save quiz results to user tracking
            UserTracking.saveQuizResult(this.language, this.level, this.score, this.questions.length, 
                this.questionData, totalDuration, this.isChallenge);
            
            // Check for new achievements
            const newAchievements = UserTracking.checkQuizAchievements();
            
            // Display new achievements if any
            if (newAchievements && newAchievements.length > 0) {
                this.displayAchievements(newAchievements);
            }
        }
    },
    
    // Display achievements earned
    displayAchievements: function(achievements) {
        if (!achievements || achievements.length === 0) return;
        
        // Create achievements container if it doesn't exist
        let achievementsContainer = document.getElementById('quizAchievements');
        if (!achievementsContainer) {
            achievementsContainer = document.createElement('div');
            achievementsContainer.id = 'quizAchievements';
            achievementsContainer.className = 'quiz-achievements';
            
            const resultsContainer = document.getElementById('quizResults');
            resultsContainer.appendChild(achievementsContainer);
        }
        
        // Clear previous achievements
        achievementsContainer.innerHTML = '<h3>🎉 Achievements Unlocked!</h3>';
        
        // Add each achievement
        const achievementsList = document.createElement('div');
        achievementsList.className = 'achievements-list';
        
        achievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-item';
            achievementItem.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;
            achievementsList.appendChild(achievementItem);
        });
        
        achievementsContainer.appendChild(achievementsList);
    },
    
    // Reset quiz to start over
    resetQuiz: function() {
        document.getElementById('quizResults').style.display = 'none';
        document.getElementById('quizStartScreen').style.display = 'block';
    },
    
    // Helper to capitalize first letter
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizUI };
}

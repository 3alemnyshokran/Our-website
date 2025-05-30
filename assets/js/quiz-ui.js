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
        
        // Update total questions display
        document.getElementById('totalQuestions').textContent = this.questions.length;
        
        // Hide start screen and show quiz content
        document.getElementById('quizStartScreen').style.display = 'none';
        document.getElementById('quizContent').style.display = 'block';
        document.getElementById('quizResults').style.display = 'none';
        
        // Display first question
        this.displayQuestion(this.currentQuestion);
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
        
        // Create question HTML
        questionContainer.innerHTML = `
            <div class="question-text">${question.question}</div>
            <ul class="options-list" id="optionsList">
                ${question.options.map((option, i) => `
                    <li class="option-item" data-index="${i}">${option}</li>
                `).join('')}
            </ul>
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
        
        // Record this attempt
        QuizManager.recordQuestionAttempt(this.language, question.id, isCorrect);
        
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
        
        // Record quiz completion in UserTracking if available
        if (typeof UserTracking !== 'undefined') {
            // You could add code here to update user tracking with quiz results
        }
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

// Quiz Manager - Handles personalized quiz generation and tracking
const QuizManager = {
    // Initialize the QuizManager
    init: function() {
        // Check if user is logged in and user tracking is loaded
        const username = localStorage.getItem('tutor_username');
        if (!username) return false;
        
        // Initialize user question history if needed
        if (!UserQuestionHistory[username]) {
            UserQuestionHistory[username] = {};
        }
        
        return true;
    },    // Generate a personalized quiz for a specific language and level
    generateQuiz: function(language, level, numQuestions = 5) {
        const username = localStorage.getItem('tutor_username');
        if (!username) return null;
        
        // Get user's progress data
        const userProgress = UserTracking.getLanguageProgress(language);
        const questions = [];
        
        // If user has no progress data, just return random questions
        if (!userProgress) {
            return this.getRandomQuestions(language, level, numQuestions);
        }
        
        // Initialize or get user's question history for this language
        if (!UserQuestionHistory[username][language]) {
            UserQuestionHistory[username][language] = {};
        }
        
        // Get user's language level based on progress
        const userLanguageLevel = this.determineUserLevel(language, userProgress);
        
        // If user's level is higher than requested level, slightly increase difficulty
        const shouldIncreaseChallenge = this.compareLevel(userLanguageLevel, level) > 0;
        
        // Check user's recent activity and performance
        const quizHistory = UserTracking.getQuizHistory(language, level);
        let adaptiveStrategy = "balanced"; // Default strategy
        
        if (quizHistory) {
            // Calculate success rate across all questions
            let totalAttempts = 0;
            let totalCorrect = 0;
            
            for (const questionId in quizHistory.questionHistory || {}) {
                const question = quizHistory.questionHistory[questionId];
                totalAttempts += question.timesAttempted || 0;
                totalCorrect += question.timesCorrect || 0;
            }
            
            const successRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) : 0.5;
            
            // Adjust strategy based on performance
            if (successRate >= 0.8) {
                adaptiveStrategy = "challenge"; // User is doing well, increase difficulty
            } else if (successRate <= 0.4) {
                adaptiveStrategy = "reinforce"; // User needs reinforcement, focus on basics
            }
        }
        
        // Get available questions for this language and level
        let availableQuestions = [];
        
        // Adaptively select questions from appropriate levels
        switch (adaptiveStrategy) {
            case "challenge":
                // Include some questions from the next level
                const nextLevel = this.getNextLevel(level);
                if (nextLevel && QuestionsData[language][nextLevel]) {
                    // Add 40% next level questions to challenge the user
                    const higherLevelCount = Math.floor(numQuestions * 0.4);
                    availableQuestions = [
                        ...(QuestionsData[language][level] || []),
                        ...(QuestionsData[language][nextLevel].slice(0, higherLevelCount) || [])
                    ];
                } else {
                    availableQuestions = QuestionsData[language][level] || [];
                }
                break;
                
            case "reinforce":
                // Include some questions from the previous level for reinforcement
                const prevLevel = this.getPreviousLevel(level);
                if (prevLevel && QuestionsData[language][prevLevel]) {
                    // Add 30% previous level questions to reinforce foundations
                    const lowerLevelCount = Math.floor(numQuestions * 0.3);
                    availableQuestions = [
                        ...(QuestionsData[language][level] || []),
                        ...(QuestionsData[language][prevLevel].slice(0, lowerLevelCount) || [])
                    ];
                } else {
                    availableQuestions = QuestionsData[language][level] || [];
                }
                break;
                
            default: // "balanced"
                availableQuestions = QuestionsData[language][level] || [];
        }
        
        if (!availableQuestions.length) {
            return this.getRandomQuestions(language, level, numQuestions);
        }
        
        // Get user achievements for personalization
        const allAchievements = UserTracking.getEarnedAchievements();
        const languageAchievements = allAchievements.filter(a => 
            a.id.startsWith(language) || a.id.includes('language_milestone')
        );
        
        // Get user's activity pattern
        const lastLoginTime = UserTracking.userProgress.lastLogin 
            ? new Date(UserTracking.userProgress.lastLogin) 
            : new Date();
        const currentTime = new Date();
        const hoursSinceLastLogin = (currentTime - lastLoginTime) / (1000 * 60 * 60);
        
        // Adjust question selection based on user's login pattern
        // If user hasn't logged in recently, include more review questions
        const needsReview = hoursSinceLastLogin > 72; // 3 days
        
        // Filter based on user history (prefer questions not seen recently or answered incorrectly)
        const userHistory = UserQuestionHistory[username][language];
        let questionPool = this.filterQuestionsByHistory(availableQuestions, userHistory);
        
        // If user needs review, prioritize previously seen questions
        if (needsReview) {
            // Boost scores of previously seen questions
            questionPool = questionPool.map(q => {
                if (userHistory && userHistory[q.id]) {
                    q.selectionScore += 20; // Boost review questions
                    q.personalizationReason = q.personalizationReason || [];
                    q.personalizationReason.push("Review session");
                }
                return q;
            });
        }
        
        // Select questions with appropriate difficulty based on user performance
        const selectedQuestions = this.selectQuestionsByDifficulty(
            questionPool, 
            numQuestions, 
            shouldIncreaseChallenge, 
            languageAchievements.length
        );
        
        // Add adaptive strategy information to help the UI explain the quiz
        selectedQuestions.forEach(q => {
            q.adaptiveStrategy = adaptiveStrategy;
        });
        
        // Randomize the order of questions
        return this.shuffleArray(selectedQuestions);
    },
    
    // Determine user's actual level based on progress
    determineUserLevel: function(language, userProgress) {
        const overallProgress = UserTracking.calculateLanguageProgress(language);
        
        // Check what levels user has started
        const startedLevels = Object.keys(userProgress.levels || {}).sort();
        if (startedLevels.length === 0) return 'a1'; // Default beginner level
        
        const highestStartedLevel = startedLevels[startedLevels.length - 1];
        
        // If user has high progress in their highest level, they might be ready for next level
        const highestLevelProgress = userProgress.levels[highestStartedLevel]?.progress || 0;
        if (highestLevelProgress >= 80) {
            // Return the next level up if possible
            const levelOrder = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
            const currentIndex = levelOrder.indexOf(highestStartedLevel);
            if (currentIndex < levelOrder.length - 1) {
                return levelOrder[currentIndex + 1];
            }
        }
        
        return highestStartedLevel;
    },
    
    // Compare two language levels (a1, a2, b1, etc.)
    compareLevel: function(levelA, levelB) {
        const levelOrder = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
        const indexA = levelOrder.indexOf(levelA);
        const indexB = levelOrder.indexOf(levelB);
        
        if (indexA === -1 || indexB === -1) return 0;
        return indexA - indexB;
    },
    
    // Filter questions based on user history
    filterQuestionsByHistory: function(questions, userHistory) {
        // Deep copy questions to avoid modifying original
        const questionPool = JSON.parse(JSON.stringify(questions));
        
        // Score each question based on history
        return questionPool.map(q => {
            const history = userHistory[q.id];
            
            // Initialize score (higher = more likely to be selected)
            let score = 50; // Base score
            
            if (history) {
                // Reduce score for recently seen questions (0-30 points off)
                const daysSinceSeen = this.daysBetween(new Date(history.lastSeen), new Date());
                const recencyPenalty = Math.max(0, 30 - daysSinceSeen);
                score -= recencyPenalty;
                
                // Increase score for questions with low success rate (0-40 points boost)
                if (history.attempts > 0) {
                    const successRate = history.correctAnswers / history.attempts;
                    const difficultyBoost = Math.round((1 - successRate) * 40);
                    score += difficultyBoost;
                }
            } else {
                // Boost unseen questions
                score += 20;
            }
            
            // Store the score with the question
            q.selectionScore = score;
            return q;
        }).sort((a, b) => b.selectionScore - a.selectionScore);
    },
      // Select questions with appropriate difficulty
    selectQuestionsByDifficulty: function(questionPool, numQuestions, increaseChallenge, achievementCount) {
        // If not enough questions, return what we have
        if (questionPool.length <= numQuestions) {
            return questionPool;
        }
        
        // Get user info for more personalized selection
        const username = localStorage.getItem('tutor_username');
        const userAchievements = UserTracking.getEarnedAchievements();
        
        // Check for specific achievements that might influence question selection
        const hasLanguageExpert = userAchievements.some(a => a.id.includes('language_expert'));
        const hasQuizMaster = userAchievements.some(a => a.id.includes('quiz_master'));
        const hasScientist = userAchievements.some(a => a.id.includes('scientist'));
        const hasMathematician = userAchievements.some(a => a.id.includes('mathematician'));
        
        // Calculate base target difficulty based on user's achievements and challenge preference
        let targetDifficulty = Math.min(3, 1 + Math.floor(achievementCount / 3));
        if (increaseChallenge) targetDifficulty += 1;
        if (hasLanguageExpert) targetDifficulty += 1;
        if (hasQuizMaster) targetDifficulty += 1;
        
        // Cap the difficulty level based on CEFR levels (1-5 scale)
        targetDifficulty = Math.min(Math.max(targetDifficulty, 1), 5);
        
        // Get user's activity data to personalize question topics
        const userProgress = UserTracking.userProgress;
        let topicPreferences = [];
        
        // Extract topic preferences based on user's activity
        if (userProgress && userProgress.languages) {
            for (const lang in userProgress.languages) {
                const langData = userProgress.languages[lang];
                
                // Extract chapter topics the user has completed
                if (langData.levels) {
                    for (const level in langData.levels) {
                        if (langData.levels[level].chapters) {
                            for (const chapterId in langData.levels[level].chapters) {
                                const chapter = langData.levels[level].chapters[chapterId];
                                if (chapter.completed && chapter.topic) {
                                    topicPreferences.push(chapter.topic);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Assign weights to questions based on user interests and achievements
        const weightedPool = questionPool.map(q => {
            let weight = 1; // Base weight
            
            // Increase weight for questions that match user's topic preferences
            if (q.topics && topicPreferences.some(topic => q.topics.includes(topic))) {
                weight += 0.5;
            }
            
            // Adjust weight based on specific achievements and question type
            if (q.type === 'science' && hasScientist) weight += 0.3;
            if (q.type === 'math' && hasMathematician) weight += 0.3;
            
            // Add a personalization property to track how this question was selected
            q.personalizationReason = [];
            if (weight > 1) q.personalizationReason.push("Based on your interests");
            if (q.difficulty === targetDifficulty) q.personalizationReason.push("Matches your skill level");
            
            return { ...q, weight };
        });
        
        // Sort by weight and then limit to needed count
        weightedPool.sort((a, b) => b.weight - a.weight);
        
        // Select a mix of questions around the target difficulty
        const result = [];
        let remainingQuestions = numQuestions;
        
        // Try to get ~60% questions at target difficulty
        const primaryCount = Math.ceil(numQuestions * 0.6);
        const primaryQuestions = weightedPool.filter(q => q.difficulty === targetDifficulty);
        
        if (primaryQuestions.length > 0) {
            for (let i = 0; i < Math.min(primaryCount, primaryQuestions.length); i++) {
                result.push(primaryQuestions[i]);
                remainingQuestions--;
            }
        }
        
        // Fill in with questions slightly above/below target difficulty
        const secondaryQuestions = weightedPool.filter(q => 
            (q.difficulty === targetDifficulty + 1 || q.difficulty === targetDifficulty - 1) &&
            !result.some(selected => selected.id === q.id)
        );
        
        if (secondaryQuestions.length > 0) {
            for (let i = 0; i < Math.min(remainingQuestions, secondaryQuestions.length); i++) {
                result.push(secondaryQuestions[i]);
                remainingQuestions--;
            }
        }
        
        // Fill the rest with random questions if we still need more
        if (remainingQuestions > 0) {
            const otherQuestions = weightedPool.filter(q => 
                !result.some(selected => selected.id === q.id)
            );
            
            for (let i = 0; i < Math.min(remainingQuestions, otherQuestions.length); i++) {
                result.push(otherQuestions[i]);
            }
        }
        
        return result;
    },
    
    // Get random questions for a given language and level
    getRandomQuestions: function(language, level, numQuestions) {
        const availableQuestions = QuestionsData[language][level] || [];
        
        if (availableQuestions.length <= numQuestions) {
            return this.shuffleArray([...availableQuestions]);
        }
        
        // Get random questions
        const selectedIndexes = new Set();
        const result = [];
        
        while (result.length < numQuestions && result.length < availableQuestions.length) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            if (!selectedIndexes.has(randomIndex)) {
                selectedIndexes.add(randomIndex);
                result.push(availableQuestions[randomIndex]);
            }
        }
        
        return result;
    },
    
    // Record question attempt in user history
    recordQuestionAttempt: function(language, questionId, isCorrect) {
        const username = localStorage.getItem('tutor_username');
        if (!username) return;
        
        // Initialize history objects if needed
        if (!UserQuestionHistory[username]) {
            UserQuestionHistory[username] = {};
        }
        
        if (!UserQuestionHistory[username][language]) {
            UserQuestionHistory[username][language] = {};
        }
        
        const now = new Date().toISOString();
        
        // Update or create question history
        if (!UserQuestionHistory[username][language][questionId]) {
            UserQuestionHistory[username][language][questionId] = {
                attempts: 1,
                correctAnswers: isCorrect ? 1 : 0,
                lastSeen: now,
                firstSeen: now
            };
        } else {
            const history = UserQuestionHistory[username][language][questionId];
            history.attempts += 1;
            history.correctAnswers += isCorrect ? 1 : 0;
            history.lastSeen = now;
        }
        
        // Save history to local storage
        localStorage.setItem('user_question_history', JSON.stringify(UserQuestionHistory));
    },
    
    // Load question history from local storage
    loadQuestionHistory: function() {
        const storedHistory = localStorage.getItem('user_question_history');
        if (storedHistory) {
            UserQuestionHistory = JSON.parse(storedHistory);
        }
    },
    
    // Helper function to calculate days between two dates
    daysBetween: function(date1, date2) {
        const oneDayMs = 24 * 60 * 60 * 1000;
        const diffMs = Math.abs(date2 - date1);
        return Math.round(diffMs / oneDayMs);
    },
      // Shuffle an array (Fisher-Yates algorithm)
    shuffleArray: function(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },
    
    // Get next level in the CEFR scale
    getNextLevel: function(level) {
        const levelOrder = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
        const currentIndex = levelOrder.indexOf(level.toLowerCase());
        
        if (currentIndex !== -1 && currentIndex < levelOrder.length - 1) {
            return levelOrder[currentIndex + 1];
        }
        
        return null;
    },
    
    // Get previous level in the CEFR scale
    getPreviousLevel: function(level) {
        const levelOrder = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
        const currentIndex = levelOrder.indexOf(level.toLowerCase());
        
        if (currentIndex > 0) {
            return levelOrder[currentIndex - 1];
        }
        
        return null;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load question history from local storage
    QuizManager.loadQuestionHistory();
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizManager };
}

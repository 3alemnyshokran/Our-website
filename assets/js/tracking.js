// User Tracking System
const UserTracking = {
    // Initialize tracking system
    init: function() {
        // Check if user is logged in
        const username = localStorage.getItem('tutor_username');
        if (!username) return false;
        
        // Load user progress data
        this.loadUserProgress();
        
        // Initialize achievements if not already set
        if (!this.userProgress.achievements) {
            this.userProgress.achievements = {
                earned: [],
                lastChecked: new Date().toISOString()
            };
            this.saveLocalProgress();
        }
        
        // Initialize quiz history if not already set
        if (!this.userProgress.quizHistory) {
            this.userProgress.quizHistory = {};
            this.saveLocalProgress();
        }
        
        return true;
    },

    // Get user data from server or local storage
    loadUserProgress: function() {
        const username = localStorage.getItem('tutor_username');
        // Try to get from localStorage first (offline capability)
        const localProgress = localStorage.getItem(`user_progress_${username}`);
        
        if (localProgress) {
            this.userProgress = JSON.parse(localProgress);
        } else {
            this.userProgress = {
                languages: {},
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Try to sync with server if online
        this.syncWithServer();
        
        return this.userProgress;
    },
    
    // Sync with server (both directions)
    syncWithServer: function() {
        const username = localStorage.getItem('tutor_username');
        if (!username) return;
        
        // Send local data to server
        fetch('/api/progress/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                progress: this.userProgress
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.serverProgress) {
                // Merge server data with local data (server wins on conflicts)
                this.mergeProgress(data.serverProgress);
                this.saveLocalProgress();
            }
        })
        .catch(error => {
            console.error('Error syncing progress:', error);
        });
    },
    
    // Merge local and server progress (resolving conflicts)
    mergeProgress: function(serverProgress) {
        if (!serverProgress) return;
        
        // Check which one is newer
        const localDate = new Date(this.userProgress.lastUpdated);
        const serverDate = new Date(serverProgress.lastUpdated);
        
        if (serverDate > localDate) {
            // Server data is newer, but we still want to keep local data that's not on server
            for (const lang in this.userProgress.languages) {
                if (!serverProgress.languages[lang]) {
                    serverProgress.languages[lang] = this.userProgress.languages[lang];
                } else {
                    // Merge levels data
                    for (const level in this.userProgress.languages[lang].levels) {
                        if (!serverProgress.languages[lang].levels[level]) {
                            serverProgress.languages[lang].levels[level] = this.userProgress.languages[lang].levels[level];
                        }
                    }
                }
            }
            
            this.userProgress = serverProgress;
        }
    },
    
    // Track a user's visit to a course chapter
    trackChapterVisit: function(language, level, chapterId) {
        if (!this.userProgress) this.loadUserProgress();
        
        // Ensure language exists in tracking
        if (!this.userProgress.languages[language]) {
            this.userProgress.languages[language] = {
                levels: {},
                startDate: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            };
        }
        
        // Ensure level exists in language
        if (!this.userProgress.languages[language].levels[level]) {
            this.userProgress.languages[language].levels[level] = {
                chapters: {},
                progress: 0,
                startDate: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            };
        }
        
        // Update language last accessed
        this.userProgress.languages[language].lastAccessed = new Date().toISOString();
        
        // Update level last accessed
        this.userProgress.languages[language].levels[level].lastAccessed = new Date().toISOString();
        
        // Track chapter visit
        if (!this.userProgress.languages[language].levels[level].chapters[chapterId]) {
            this.userProgress.languages[language].levels[level].chapters[chapterId] = {
                visits: 0,
                completed: false,
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString(),
                timeSpent: 0 // in seconds
            };
        }
        
        // Update chapter data
        const chapterData = this.userProgress.languages[language].levels[level].chapters[chapterId];
        chapterData.visits += 1;
        chapterData.lastVisit = new Date().toISOString();
        
        // Start timing for time spent calculation
        sessionStorage.setItem('chapter_start_time', new Date().getTime());
        
        // Save progress
        this.saveProgress();
        
        return this.userProgress.languages[language].levels[level].chapters[chapterId];
    },
    
    // Mark a chapter as complete
    completeChapter: function(language, level, chapterId) {
        if (!this.userProgress) this.loadUserProgress();
        
        // Ensure proper structure exists
        this.trackChapterVisit(language, level, chapterId);
        
        // Mark chapter as complete
        this.userProgress.languages[language].levels[level].chapters[chapterId].completed = true;
        
        // Calculate level progress
        this.calculateLevelProgress(language, level);
        
        // Save progress
        this.saveProgress();
        
        return this.userProgress.languages[language].levels[level].progress;
    },
    
    // Calculate progress percentage for a level
    calculateLevelProgress: function(language, level) {
        if (!this.userProgress?.languages[language]?.levels[level]) return 0;
        
        const chapters = this.userProgress.languages[language].levels[level].chapters;
        
        let totalChapters = 0;
        let completedChapters = 0;
        
        for (const chapterId in chapters) {
            totalChapters++;
            if (chapters[chapterId].completed) {
                completedChapters++;
            }
        }
        
        const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
        this.userProgress.languages[language].levels[level].progress = progress;
        
        return progress;
    },
    
    // Calculate overall language progress
    calculateLanguageProgress: function(language) {
        if (!this.userProgress?.languages[language]) return 0;
        
        const levels = this.userProgress.languages[language].levels;
        let totalProgress = 0;
        let levelCount = 0;
        
        for (const level in levels) {
            totalProgress += this.calculateLevelProgress(language, level);
            levelCount++;
        }
        
        const overallProgress = levelCount > 0 ? Math.round(totalProgress / levelCount) : 0;
        this.userProgress.languages[language].progress = overallProgress;
        
        return overallProgress;
    },
    
    // Track time spent on chapter when leaving
    trackChapterExit: function(language, level, chapterId) {
        const startTime = sessionStorage.getItem('chapter_start_time');
        if (!startTime) return;
        
        const timeSpent = Math.round((new Date().getTime() - parseInt(startTime)) / 1000);
        sessionStorage.removeItem('chapter_start_time');
        
        if (!this.userProgress) this.loadUserProgress();
        
        // Ensure proper structure exists
        if (!this.userProgress.languages[language]?.levels[level]?.chapters[chapterId]) {
            return;
        }
        
        // Update time spent
        this.userProgress.languages[language].levels[level].chapters[chapterId].timeSpent += timeSpent;
        
        // Save progress
        this.saveProgress();
    },
    
    // Save progress to local storage
    saveLocalProgress: function() {
        const username = localStorage.getItem('tutor_username');
        if (!username) return;
        
        this.userProgress.lastUpdated = new Date().toISOString();
        localStorage.setItem(`user_progress_${username}`, JSON.stringify(this.userProgress));
    },
    
    // Save progress both locally and try to sync with server
    saveProgress: function() {
        this.saveLocalProgress();
        this.syncWithServer();
    },
    
    // Get user progress for a specific language
    getLanguageProgress: function(language) {
        if (!this.userProgress) this.loadUserProgress();
        return this.userProgress.languages[language] || null;
    },
    
    // Get user progress for all languages
    getAllProgress: function() {
        if (!this.userProgress) this.loadUserProgress();
        return this.userProgress.languages || {};
    },
    
    // Reset progress for testing
    resetProgress: function() {
        const username = localStorage.getItem('tutor_username');
        if (!username) return;
        
        this.userProgress = {
            languages: {},
            achievements: {
                earned: [],
                lastChecked: new Date().toISOString()
            },
            lastUpdated: new Date().toISOString()
        };
        
        this.saveLocalProgress();
        this.syncWithServer();
    },
    
    // Achievement tracking system
    
    // Checks for new achievements and awards them
    checkForAchievements: function() {
        if (!this.userProgress) this.loadUserProgress();
        
        const allAchievements = this.getAvailableAchievements();
        const earnedIds = new Set(this.userProgress.achievements.earned.map(a => a.id));
        const newAchievements = [];
        
        // Check each achievement criteria
        for (const achievement of allAchievements) {
            // Skip already earned achievements
            if (earnedIds.has(achievement.id)) continue;
            
            // Check if achievement criteria are met
            if (this.checkAchievementCriteria(achievement)) {
                // Award the achievement
                const earnedAchievement = {
                    id: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    earnedAt: new Date().toISOString()
                };
                
                this.userProgress.achievements.earned.push(earnedAchievement);
                newAchievements.push(earnedAchievement);
            }
        }
        
        // If new achievements earned, save progress
        if (newAchievements.length > 0) {
            this.userProgress.achievements.lastChecked = new Date().toISOString();
            this.saveProgress();
        }
        
        // Check for quiz-related achievements
        this.checkQuizAchievements();
        
        return newAchievements;
    },
    
    // Check for quiz-related achievements
    checkQuizAchievements: function() {
        const username = localStorage.getItem('tutor_username');
        if (!username || !this.userProgress.quizHistory) return [];
        
        const newAchievements = [];
        const earnedAchievementIds = this.getEarnedAchievements().map(a => a.id);
        
        // Check for language-specific quiz achievements
        const languages = Object.keys(this.userProgress.quizHistory);
        
        // Process each language
        languages.forEach(language => {
            // Check for perfect scores
            const perfectScoreAchievementId = `quiz-perfect-${language}`;
            if (!earnedAchievementIds.includes(perfectScoreAchievementId) && 
                this.hasPerfectScoreAchievement(language)) {
                    
                newAchievements.push({
                    id: perfectScoreAchievementId,
                    name: `Perfect Quiz: ${this.capitalizeFirstLetter(language)}`,
                    description: 'Get a perfect score on 3 quizzes in a row',
                    icon: '🎯'
                });
                
                this.addAchievement(perfectScoreAchievementId, newAchievements[newAchievements.length - 1]);
            }
            
            // Check for quiz dedication
            const quizDedicationAchievementId = `quiz-dedication-${language}`;
            if (!earnedAchievementIds.includes(quizDedicationAchievementId) && 
                this.hasQuizDedicationAchievement(language)) {
                    
                newAchievements.push({
                    id: quizDedicationAchievementId,
                    name: `Quiz Master: ${this.capitalizeFirstLetter(language)}`,
                    description: 'Complete 20 quizzes in this language',
                    icon: '🏆'
                });
                
                this.addAchievement(quizDedicationAchievementId, newAchievements[newAchievements.length - 1]);
            }
            
            // Check for challenging quizzes
            const challengeQuizAchievementId = `quiz-challenge-${language}`;
            if (!earnedAchievementIds.includes(challengeQuizAchievementId) && 
                this.hasCompletedChallengingQuizzes(language)) {
                    
                newAchievements.push({
                    id: challengeQuizAchievementId,
                    name: `Quiz Champion: ${this.capitalizeFirstLetter(language)}`,
                    description: 'Successfully complete 5 challenge-level quizzes',
                    icon: '🏅'
                });
                
                this.addAchievement(challengeQuizAchievementId, newAchievements[newAchievements.length - 1]);
            }
            
            // Check for all levels achievement
            const allLevelsQuizAchievementId = `quiz-all-levels-${language}`;
            if (!earnedAchievementIds.includes(allLevelsQuizAchievementId) && 
                this.hasCompletedQuizzesInAllLevels(language)) {
                    
                newAchievements.push({
                    id: allLevelsQuizAchievementId,
                    name: `Level Explorer: ${this.capitalizeFirstLetter(language)}`,
                    description: 'Complete quizzes in every available level for this language',
                    icon: '🌟'
                });
                
                this.addAchievement(allLevelsQuizAchievementId, newAchievements[newAchievements.length - 1]);
            }
        });
        
        // Global quiz achievements
        const fastLearnerAchievementId = 'quiz-fast-learner';
        if (!earnedAchievementIds.includes(fastLearnerAchievementId) && 
            this.hasCompletedQuizzesQuickly()) {
                
            newAchievements.push({
                id: fastLearnerAchievementId,
                name: 'Quick Thinker',
                description: 'Complete 3 quizzes in under 2 minutes each with at least 80% accuracy',
                icon: '⚡'
            });
            
            this.addAchievement(fastLearnerAchievementId, newAchievements[newAchievements.length - 1]);
        }
        
        // Multi-language quiz achievement
        const polyglotAchievementId = 'quiz-polyglot';
        if (!earnedAchievementIds.includes(polyglotAchievementId) && 
            this.hasCompletedQuizzesInMultipleLanguages()) {
                
            newAchievements.push({
                id: polyglotAchievementId,
                name: 'Quiz Polyglot',
                description: 'Complete quizzes in at least 3 different languages',
                icon: '🌍'
            });
            
            this.addAchievement(polyglotAchievementId, newAchievements[newAchievements.length - 1]);
        }
        
        return newAchievements;
    },
    
    // Check if user has perfect scores in a row
    hasPerfectScoreAchievement: function(language) {
        const quizHistory = this.userProgress.quizHistory[language];
        if (!quizHistory) return false;
        
        let perfectScoresInARow = 0;
        const quizResults = [];
        
        // Collect all quiz results across levels
        for (const level in quizHistory) {
            if (quizHistory[level] && quizHistory[level].quizResults) {
                quizResults.push(...quizHistory[level].quizResults);
            }
        }
        
        // Sort by date (newest first)
        quizResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Check last 3 quizzes
        for (let i = 0; i < Math.min(quizResults.length, 3); i++) {
            const quiz = quizResults[i];
            if (quiz.score === quiz.totalQuestions) {
                perfectScoresInARow++;
            } else {
                break;
            }
        }
        
        return perfectScoresInARow >= 3;
    },
    
    // Check if user has completed 20+ quizzes
    hasQuizDedicationAchievement: function(language) {
        const quizHistory = this.userProgress.quizHistory[language];
        if (!quizHistory) return false;
        
        let totalQuizzesTaken = 0;
        
        // Count quizzes across all levels
        for (const level in quizHistory) {
            if (quizHistory[level] && quizHistory[level].quizzesTaken) {
                totalQuizzesTaken += quizHistory[level].quizzesTaken;
            }
        }
        
        return totalQuizzesTaken >= 20;
    },
    
    // Check if user has completed challenging quizzes
    hasCompletedChallengingQuizzes: function(language) {
        const quizHistory = this.userProgress.quizHistory[language];
        if (!quizHistory) return false;
        
        let challengingQuizzesCompleted = 0;
        
        // Look through all levels
        for (const level in quizHistory) {
            if (quizHistory[level] && quizHistory[level].quizResults) {
                // Count quizzes marked as challenging with a good score
                challengingQuizzesCompleted += quizHistory[level].quizResults.filter(quiz => 
                    quiz.wasChallenge === true && 
                    (quiz.score / quiz.totalQuestions) >= 0.7 // At least 70% correct
                ).length;
            }
        }
        
        return challengingQuizzesCompleted >= 5;
    },
    
    // Check if user has completed quizzes in all available levels
    hasCompletedQuizzesInAllLevels: function(language) {
        const quizHistory = this.userProgress.quizHistory[language];
        if (!quizHistory) return false;
        
        // Get all available levels for this language from QuestionsData
        let availableLevels = [];
        if (typeof QuestionsData !== 'undefined' && QuestionsData[language]) {
            availableLevels = Object.keys(QuestionsData[language]);
        } else {
            // Default CEFR levels if QuestionsData isn't available
            availableLevels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
        }
        
        // Check if user has taken quizzes in all available levels
        const completedLevels = Object.keys(quizHistory).filter(level => 
            quizHistory[level] && 
            quizHistory[level].quizzesTaken && 
            quizHistory[level].quizzesTaken > 0
        );
        
        // Compare with actual available levels from QuestionsData
        const availableLevelSet = new Set(availableLevels);
        const completedLevelSet = new Set(completedLevels);
        
        // Check if all available levels have been completed
        return [...availableLevelSet].every(level => completedLevelSet.has(level));
    },
    
    // Check if user has completed quizzes quickly
    hasCompletedQuizzesQuickly: function() {
        const quizHistory = this.userProgress.quizHistory;
        if (!quizHistory) return false;
        
        let fastQuizzes = 0;
        
        // Check all languages and levels
        for (const language in quizHistory) {
            for (const level in quizHistory[language]) {
                if (quizHistory[language][level] && quizHistory[language][level].quizResults) {
                    // Count quizzes completed quickly with good accuracy
                    fastQuizzes += quizHistory[language][level].quizResults.filter(quiz => 
                        quiz.duration && 
                        quiz.duration <= 120 && // 2 minutes or less
                        (quiz.score / quiz.totalQuestions) >= 0.8 // At least 80% correct
                    ).length;
                }
            }
        }
        
        return fastQuizzes >= 3;
    },
    
    // Check if user has completed quizzes in multiple languages
    hasCompletedQuizzesInMultipleLanguages: function() {
        const quizHistory = this.userProgress.quizHistory;
        if (!quizHistory) return false;
        
        // Count languages with at least one quiz completed
        const languagesWithQuizzes = Object.keys(quizHistory).filter(language => {
            // Check if any level in this language has quizzes
            return Object.values(quizHistory[language]).some(level => 
                level && level.quizzesTaken && level.quizzesTaken > 0
            );
        });
        
        return languagesWithQuizzes.length >= 3;
    },
    
    // ...existing code...
}

// User Question History to track which questions have been seen by users
const UserQuestionHistory = {};

// Load history from localStorage if available
(function() {
    const savedHistory = localStorage.getItem('user_question_history');
    if (savedHistory) {
        try {
            Object.assign(UserQuestionHistory, JSON.parse(savedHistory));
        } catch (e) {
            console.error('Error parsing user question history', e);
        }
    }
})();

// Update user's question history for personalized quizzes
// Record question attempt in quiz history for achievement tracking
UserTracking.recordQuizQuestionAttempt = function(language, level, questionId, correct) {
    if (!this.userProgress.quizHistory) {
        this.userProgress.quizHistory = {};
    }
    
    if (!this.userProgress.quizHistory[language]) {
        this.userProgress.quizHistory[language] = {};
    }
    
    if (!this.userProgress.quizHistory[language][level]) {
        this.userProgress.quizHistory[language][level] = {
            quizzesTaken: 0,
            quizResults: [],
            questionHistory: {}
        };
    }
    
    // Initialize question history if needed
    if (!this.userProgress.quizHistory[language][level].questionHistory) {
        this.userProgress.quizHistory[language][level].questionHistory = {};
    }
    
    if (!this.userProgress.quizHistory[language][level].questionHistory[questionId]) {
        this.userProgress.quizHistory[language][level].questionHistory[questionId] = {
            timesAttempted: 0,
            timesCorrect: 0,
            lastAttempted: null
        };
    }
    
    // Update attempt info
    const qHistory = this.userProgress.quizHistory[language][level].questionHistory[questionId];
    qHistory.timesAttempted++;
    if (correct) qHistory.timesCorrect++;
    qHistory.lastAttempted = new Date().toISOString();
    
    // Save progress
    this.saveProgress();
    
    return true;
};

UserTracking.updateQuestionHistory = function(language, level, questionId, correct, timeSpent) {
    const username = localStorage.getItem('tutor_username');
    if (!username) return false;
    
    // Initialize user's question history
    if (!UserQuestionHistory[username]) {
        UserQuestionHistory[username] = {};
    }
    
    // Initialize language history
    if (!UserQuestionHistory[username][language]) {
        UserQuestionHistory[username][language] = {};
    }
    
    // Initialize question history
    if (!UserQuestionHistory[username][language][questionId]) {
        UserQuestionHistory[username][language][questionId] = {
            attempts: 0,
            correctAnswers: 0,
            lastSeen: null,
            timeSpent: 0,
            difficulty: 0 // User's perceived difficulty (0-5)
        };
    }
    
    const questionHistory = UserQuestionHistory[username][language][questionId];
    
    // Update history
    questionHistory.attempts++;
    if (correct) questionHistory.correctAnswers++;
    questionHistory.lastSeen = new Date().toISOString();
    questionHistory.timeSpent += timeSpent || 0;
    
    // Calculate perceived difficulty (higher time and lower success rate means higher difficulty)
    const successRate = questionHistory.attempts > 0 ? 
        questionHistory.correctAnswers / questionHistory.attempts : 0;
    const avgTimeSpent = questionHistory.attempts > 0 ? 
        questionHistory.timeSpent / questionHistory.attempts : 0;
    
    // Normalize time: 0-15s is easy, 15-30s is medium, >30s is hard
    const timeScore = Math.min(Math.floor(avgTimeSpent / 10), 3);
    // Success rate: >80% is easy, 50-80% is medium, <50% is hard
    const successScore = successRate > 0.8 ? 0 : (successRate > 0.5 ? 1 : 2);
    
    // Combined perceived difficulty score (0-5)
    questionHistory.difficulty = timeScore + successScore;
      // Also update quiz history in user progress for achievement tracking
    if (this.recordQuizQuestionAttempt) {
        this.recordQuizQuestionAttempt(language, level, questionId, correct);
    }
    
    // Save to localStorage
    localStorage.setItem('user_question_history', JSON.stringify(UserQuestionHistory));
    
    return true;
};

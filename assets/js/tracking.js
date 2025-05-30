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
        
        return newAchievements;
    },
    
    // Check if a specific achievement's criteria are met
    checkAchievementCriteria: function(achievement) {
        switch (achievement.id) {
            case 'first_language_start':
                // Check if user has started at least one language
                return Object.keys(this.userProgress.languages).length >= 1;
                
            case 'language_explorer':
                // Check if user has started at least 3 languages
                return Object.keys(this.userProgress.languages).length >= 3;
                
            case 'polyglot_master':
                // Check if user has started all 5 subjects (languages + math + science)
                return Object.keys(this.userProgress.languages).length >= 5;
                
            case 'first_chapter_complete':
                // Check if user has completed at least one chapter
                return this.hasCompletedAnyChapter();
                
            case 'language_milestone_25':
            case 'language_milestone_50':
            case 'language_milestone_75':
            case 'language_milestone_100':
                // Extract percentage from ID (25, 50, 75, 100)
                const targetProgress = parseInt(achievement.id.split('_').pop());
                // Check if any language has reached this milestone
                return this.hasLanguageWithProgress(targetProgress);
                
            case 'level_master':
                // Check if user has completed all chapters in any level
                return this.hasCompletedAnyLevel();
                
            case 'language_master':
                // Check if user has completed all levels in any language
                return this.hasCompletedAnyLanguage();
                
            case 'study_time_1h':
            case 'study_time_10h':
            case 'study_time_50h':
            case 'study_time_100h':
                // Extract hours from ID (1, 10, 50, 100)
                const targetHours = parseInt(achievement.id.split('_').pop().replace('h', ''));
                // Check if total study time has reached this milestone (in seconds)
                return this.getTotalStudyTime() >= targetHours * 3600;
                
            case 'daily_streak_3':
            case 'daily_streak_7':
            case 'daily_streak_30':
                // Extract days from ID (3, 7, 30)
                const targetDays = parseInt(achievement.id.split('_').pop());
                // Check if current streak is at least this long
                return this.getCurrentStreak() >= targetDays;
                
            // Language-specific achievements
            case 'english_starter':
                return this.hasStartedLanguage('english');
            case 'german_starter':
                return this.hasStartedLanguage('german');
            case 'arabic_starter':
                return this.hasStartedLanguage('arabic');
            case 'math_starter':
                return this.hasStartedLanguage('math');
            case 'science_starter':
                return this.hasStartedLanguage('science');
                
            // Language progress achievements
            case 'english_novice':
                return this.hasLanguageWithProgress('english', 25);
            case 'english_intermediate':
                return this.hasLanguageWithProgress('english', 50);
            case 'english_advanced':
                return this.hasLanguageWithProgress('english', 75);
            case 'english_fluent':
                return this.hasLanguageWithProgress('english', 100);
                
            case 'german_novice':
                return this.hasLanguageWithProgress('german', 25);
            case 'german_intermediate':
                return this.hasLanguageWithProgress('german', 50);
            case 'german_advanced':
                return this.hasLanguageWithProgress('german', 75);
            case 'german_fluent':
                return this.hasLanguageWithProgress('german', 100);
                
            case 'arabic_novice':
                return this.hasLanguageWithProgress('arabic', 25);
            case 'arabic_intermediate':
                return this.hasLanguageWithProgress('arabic', 50);
            case 'arabic_advanced':
                return this.hasLanguageWithProgress('arabic', 75);
            case 'arabic_fluent':
                return this.hasLanguageWithProgress('arabic', 100);
                
            case 'math_novice':
                return this.hasLanguageWithProgress('math', 25);
            case 'math_intermediate':
                return this.hasLanguageWithProgress('math', 50);
            case 'math_advanced':
                return this.hasLanguageWithProgress('math', 75);
            case 'math_master':
                return this.hasLanguageWithProgress('math', 100);
                
            case 'science_novice':
                return this.hasLanguageWithProgress('science', 25);
            case 'science_intermediate':
                return this.hasLanguageWithProgress('science', 50);
            case 'science_advanced':
                return this.hasLanguageWithProgress('science', 75);
            case 'science_master':
                return this.hasLanguageWithProgress('science', 100);
                
            default:
                return false;
        }
    },
    
    // Helper method: Check if user has completed any chapter in any language
    hasCompletedAnyChapter: function() {
        for (const language in this.userProgress.languages) {
            for (const level in this.userProgress.languages[language].levels) {
                const chapters = this.userProgress.languages[language].levels[level].chapters;
                for (const chapter in chapters) {
                    if (chapters[chapter].completed) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    
    // Helper method: Check if user has completed all chapters in any level
    hasCompletedAnyLevel: function() {
        for (const language in this.userProgress.languages) {
            for (const level in this.userProgress.languages[language].levels) {
                if (this.userProgress.languages[language].levels[level].progress === 100) {
                    return true;
                }
            }
        }
        return false;
    },
    
    // Helper method: Check if user has completed all levels in any language
    hasCompletedAnyLanguage: function() {
        for (const language in this.userProgress.languages) {
            if (this.calculateLanguageProgress(language) === 100) {
                return true;
            }
        }
        return false;
    },
    
    // Helper method: Calculate total study time across all languages (in seconds)
    getTotalStudyTime: function() {
        let totalTime = 0;
        
        for (const language in this.userProgress.languages) {
            for (const level in this.userProgress.languages[language].levels) {
                const chapters = this.userProgress.languages[language].levels[level].chapters;
                for (const chapter in chapters) {
                    totalTime += chapters[chapter].timeSpent || 0;
                }
            }
        }
        
        return totalTime;
    },
    
    // Helper method: Calculate current daily streak
    getCurrentStreak: function() {
        if (!this.userProgress.streak) {
            return 0;
        }
        
        return this.userProgress.streak.current || 0;
    },
    
    // Get list of available achievements
    getAvailableAchievements: function() {
        return [
            {
                id: 'first_language_start',
                name: 'First Steps',
                description: 'Started learning your first language',
                icon: '🔤'
            },
            {
                id: 'language_explorer',
                name: 'Explorer',
                description: 'Started learning 3 different languages or subjects',
                icon: '🧭'
            },
            {
                id: 'polyglot_master',
                name: 'Polyglot Master',
                description: 'Started learning all 5 languages and subjects',
                icon: '🌍'
            },
            {
                id: 'first_chapter_complete',
                name: 'Chapter Completed',
                description: 'Completed your first chapter',
                icon: '📖'
            },
            {
                id: 'language_milestone_25',
                name: 'On Your Way',
                description: 'Reached 25% progress in any language',
                icon: '🌱'
            },
            {
                id: 'language_milestone_50',
                name: 'Halfway There',
                description: 'Reached 50% progress in any language',
                icon: '🌿'
            },
            {
                id: 'language_milestone_75',
                name: 'Almost There',
                description: 'Reached 75% progress in any language',
                icon: '🌳'
            },
            {
                id: 'language_milestone_100',
                name: 'Language Mastered',
                description: 'Completed 100% of any language',
                icon: '🏆'
            },
            {
                id: 'level_master',
                name: 'Level Master',
                description: 'Completed all chapters in a level',
                icon: '⭐'
            },
            {
                id: 'language_master',
                name: 'Language Virtuoso',
                description: 'Completed all levels in a language',
                icon: '👑'
            },
            {
                id: 'study_time_1h',
                name: 'Dedicated Student',
                description: 'Spent 1 hour learning',
                icon: '⏱️'
            },
            {
                id: 'study_time_10h',
                name: 'Committed Student',
                description: 'Spent 10 hours learning',
                icon: '⏰'
            },
            {
                id: 'study_time_50h',
                name: 'Learning Enthusiast',
                description: 'Spent 50 hours learning',
                icon: '🕰️'
            },
            {
                id: 'study_time_100h',
                name: 'Learning Expert',
                description: 'Spent 100 hours learning',
                icon: '🧠'
            },
            {
                id: 'daily_streak_3',
                name: 'Getting Consistent',
                description: 'Learned 3 days in a row',
                icon: '🔥'
            },
            {
                id: 'daily_streak_7',
                name: 'Weekly Warrior',
                description: 'Learned 7 days in a row',
                icon: '📅'
            },
            {
                id: 'daily_streak_30',
                name: 'Monthly Master',
                description: 'Learned 30 days in a row',
                icon: '🏅'
            },
            // English achievements
            {
                id: 'english_starter',
                name: 'English Beginner',
                description: 'Started learning English',
                icon: '🇬🇧'
            },
            {
                id: 'english_novice',
                name: 'English Novice',
                description: 'Reached 25% progress in English',
                icon: '📝'
            },
            {
                id: 'english_intermediate',
                name: 'English Intermediate',
                description: 'Reached 50% progress in English',
                icon: '📚'
            },
            {
                id: 'english_advanced',
                name: 'English Advanced',
                description: 'Reached 75% progress in English',
                icon: '🎓'
            },
            {
                id: 'english_fluent',
                name: 'English Fluent',
                description: 'Completed the English course',
                icon: '🏆'
            },
            // German achievements
            {
                id: 'german_starter',
                name: 'German Beginner',
                description: 'Started learning German',
                icon: '🇩🇪'
            },
            {
                id: 'german_novice',
                name: 'German Novice',
                description: 'Reached 25% progress in German',
                icon: '📝'
            },
            {
                id: 'german_intermediate',
                name: 'German Intermediate',
                description: 'Reached 50% progress in German',
                icon: '📚'
            },
            {
                id: 'german_advanced',
                name: 'German Advanced',
                description: 'Reached 75% progress in German',
                icon: '🎓'
            },
            {
                id: 'german_fluent',
                name: 'German Fluent',
                description: 'Completed the German course',
                icon: '🏆'
            },
            // Arabic achievements
            {
                id: 'arabic_starter',
                name: 'Arabic Beginner',
                description: 'Started learning Arabic',
                icon: '🇸🇦'
            },
            {
                id: 'arabic_novice',
                name: 'Arabic Novice',
                description: 'Reached 25% progress in Arabic',
                icon: '📝'
            },
            {
                id: 'arabic_intermediate',
                name: 'Arabic Intermediate',
                description: 'Reached 50% progress in Arabic',
                icon: '📚'
            },
            {
                id: 'arabic_advanced',
                name: 'Arabic Advanced',
                description: 'Reached 75% progress in Arabic',
                icon: '🎓'
            },
            {
                id: 'arabic_fluent',
                name: 'Arabic Fluent',
                description: 'Completed the Arabic course',
                icon: '🏆'
            },
            // Math achievements
            {
                id: 'math_starter',
                name: 'Math Explorer',
                description: 'Started learning Mathematics',
                icon: '🧮'
            },
            {
                id: 'math_novice',
                name: 'Math Novice',
                description: 'Reached 25% progress in Mathematics',
                icon: '📊'
            },
            {
                id: 'math_intermediate',
                name: 'Math Problem Solver',
                description: 'Reached 50% progress in Mathematics',
                icon: '📐'
            },
            {
                id: 'math_advanced',
                name: 'Math Wizard',
                description: 'Reached 75% progress in Mathematics',
                icon: '📏'
            },
            {
                id: 'math_master',
                name: 'Math Master',
                description: 'Completed the Mathematics course',
                icon: '🧠'
            },
            // Science achievements
            {
                id: 'science_starter',
                name: 'Science Explorer',
                description: 'Started learning Science',
                icon: '🔬'
            },
            {
                id: 'science_novice',
                name: 'Science Novice',
                description: 'Reached 25% progress in Science',
                icon: '🧪'
            },
            {
                id: 'science_intermediate',
                name: 'Science Enthusiast',
                description: 'Reached 50% progress in Science',
                icon: '🧫'
            },
            {
                id: 'science_advanced',
                name: 'Science Expert',
                description: 'Reached 75% progress in Science',
                icon: '🔭'
            },
            {
                id: 'science_master',
                name: 'Science Master',
                description: 'Completed the Science course',
                icon: '⚛️'
            }
        ];
    },
    
    // Get earned achievements
    getEarnedAchievements: function() {
        if (!this.userProgress) this.loadUserProgress();
        
        if (!this.userProgress.achievements) {
            this.userProgress.achievements = {
                earned: [],
                lastChecked: new Date().toISOString()
            };
            this.saveLocalProgress();
        }
        
        return this.userProgress.achievements.earned;
    },
    
    // Track daily streak
    updateStreak: function() {
        if (!this.userProgress) this.loadUserProgress();
        
        // Initialize streak if it doesn't exist
        if (!this.userProgress.streak) {
            this.userProgress.streak = {
                current: 1,
                best: 1,
                lastActivity: new Date().toISOString(),
                activeDays: [new Date().toISOString().split('T')[0]]
            };
            this.saveProgress();
            return this.userProgress.streak;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = new Date(this.userProgress.streak.lastActivity);
        const lastActivityDay = lastActivityDate.toISOString().split('T')[0];
        
        // Already recorded activity today
        if (lastActivityDay === today) {
            return this.userProgress.streak;
        }
        
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityDay === yesterdayStr) {
            // Consecutive day, increment streak
            this.userProgress.streak.current += 1;
            if (this.userProgress.streak.current > this.userProgress.streak.best) {
                this.userProgress.streak.best = this.userProgress.streak.current;
            }
        } else {
            // Streak broken, reset to 1
            this.userProgress.streak.current = 1;
        }
        
        // Update last activity
        this.userProgress.streak.lastActivity = new Date().toISOString();
        
        // Add today to active days if not already there
        if (!this.userProgress.streak.activeDays.includes(today)) {
            this.userProgress.streak.activeDays.push(today);
        }
        
        // Save changes
        this.saveProgress();
        
        return this.userProgress.streak;
    },
    
    // Helper method: Check if the user has started a specific language/subject
    hasStartedLanguage: function(language) {
        return this.userProgress.languages && 
               this.userProgress.languages[language] && 
               Object.keys(this.userProgress.languages[language].levels || {}).length > 0;
    },
    
    // Helper method: Check if a specific language has reached a certain progress threshold
    hasLanguageWithProgress: function(language, targetProgress) {
        // If called with only one parameter, check across all languages (legacy behavior)
        if (targetProgress === undefined) {
            targetProgress = language;
            for (const lang in this.userProgress.languages) {
                const langProgress = this.calculateLanguageProgress(lang);
                if (langProgress >= targetProgress) {
                    return true;
                }
            }
            return false;
        }
        
        // Check for specific language progress
        if (!this.userProgress.languages || !this.userProgress.languages[language]) {
            return false;
        }
        
        const langProgress = this.calculateLanguageProgress(language);
        return langProgress >= targetProgress;
    },
    
    // Quiz-related tracking methods
    
    // Save quiz results
    saveQuizResult: function(language, level, score, totalQuestions, questionsData) {
        const username = localStorage.getItem('tutor_username');
        if (!username) return false;
        
        // Initialize quiz history for this language if doesn't exist
        if (!this.userProgress.quizHistory[language]) {
            this.userProgress.quizHistory[language] = {};
        }
        
        // Initialize quiz history for this level if doesn't exist
        if (!this.userProgress.quizHistory[language][level]) {
            this.userProgress.quizHistory[language][level] = {
                quizzesTaken: 0,
                totalScore: 0,
                highestScore: 0,
                questionHistory: {}
            };
        }
        
        const quizHistory = this.userProgress.quizHistory[language][level];
        quizHistory.quizzesTaken++;
        quizHistory.totalScore += score;
        
        // Update highest score if current score is higher
        if (score > quizHistory.highestScore) {
            quizHistory.highestScore = score;
        }
        
        // Track individual question performance
        questionsData.forEach(q => {
            if (!quizHistory.questionHistory[q.id]) {
                quizHistory.questionHistory[q.id] = {
                    timesAttempted: 0,
                    timesCorrect: 0
                };
            }
            
            quizHistory.questionHistory[q.id].timesAttempted++;
            if (q.userAnswer === q.correctAnswer) {
                quizHistory.questionHistory[q.id].timesCorrect++;
            }
        });
        
        // Save progress data
        this.saveLocalProgress();
        
        // Check for quiz-related achievements
        this.checkQuizAchievements(language, level);
        
        return true;
    },
    
    // Get quiz history for a user
    getQuizHistory: function(language, level) {
        const username = localStorage.getItem('tutor_username');
        if (!username) return null;
        
        if (!this.userProgress.quizHistory || 
            !this.userProgress.quizHistory[language] || 
            !this.userProgress.quizHistory[language][level]) {
            return null;
        }
        
        return this.userProgress.quizHistory[language][level];
    },
    
    // Get user's performance on specific questions
    getQuestionPerformance: function(language, level, questionId) {
        const quizHistory = this.getQuizHistory(language, level);
        if (!quizHistory || !quizHistory.questionHistory || !quizHistory.questionHistory[questionId]) {
            return null;
        }
        
        return quizHistory.questionHistory[questionId];
    },
    
    // Check for quiz-related achievements
    checkQuizAchievements: function(language, level) {
        const quizHistory = this.getQuizHistory(language, level);
        if (!quizHistory) return;
        
        const achievements = [];
        
        // Quiz Master - Get 5 quizzes with perfect scores
        if (this.isPerfectScoreAchievementEarned(language)) {
            achievements.push({
                id: 'quiz-master-' + language,
                name: 'Quiz Master: ' + this.capitalizeFirstLetter(language),
                description: 'Completed 5 quizzes with perfect scores',
                icon: '🏆'
            });
        }
        
        // Quiz Enthusiast - Complete 10 quizzes
        if (this.isQuizEnthusiastAchievementEarned(language)) {
            achievements.push({
                id: 'quiz-enthusiast-' + language,
                name: 'Quiz Enthusiast: ' + this.capitalizeFirstLetter(language),
                description: 'Completed 10 or more quizzes',
                icon: '🎯'
            });
        }
        
        // Add new achievements to user's earned achievements
        if (achievements.length > 0) {
            this.addAchievements(achievements);
        }
    },
    
    // Check if user has earned Quiz Master achievement
    isPerfectScoreAchievementEarned: function(language) {
        // Count perfect scores across all levels
        let perfectScores = 0;
        
        if (!this.userProgress.quizHistory[language]) {
            return false;
        }
        
        // Check each level
        for (const level in this.userProgress.quizHistory[language]) {
            const levelHistory = this.userProgress.quizHistory[language][level];
            
            // Count quizzes where score equals total questions (perfect score)
            const quizResults = levelHistory.quizResults || [];
            perfectScores += quizResults.filter(quiz => quiz.score === quiz.totalQuestions).length;
            
            // If already reached 5, return true
            if (perfectScores >= 5) {
                return true;
            }
        }
        
        return perfectScores >= 5;
    },
    
    // Check if user has earned Quiz Enthusiast achievement
    isQuizEnthusiastAchievementEarned: function(language) {
        // Count total quizzes taken across all levels
        let totalQuizzes = 0;
        
        if (!this.userProgress.quizHistory[language]) {
            return false;
        }
        
        // Add up quizzes taken for each level
        for (const level in this.userProgress.quizHistory[language]) {
            totalQuizzes += this.userProgress.quizHistory[language][level].quizzesTaken || 0;
        }
        
        return totalQuizzes >= 10;
    },
    
    // Helper method to capitalize first letter of a string
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
};

// User Question History to track which questions have been seen by users
const UserQuestionHistory = {};

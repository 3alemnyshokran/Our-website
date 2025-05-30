// Questions Database for all languages and levels
const QuestionsData = {
    english: {        a1: [
            {
                id: "eng-a1-q1",
                question: "What is the correct greeting for morning?",
                options: ["Good morning", "Good afternoon", "Good evening", "Good night"],
                correctAnswer: 0,
                difficulty: 1,
                topics: ["greetings", "basics", "social"],
                type: "vocabulary",
                context: "daily communication"
            },
            {
                id: "eng-a1-q2",
                question: "Which word is a noun?",
                options: ["Run", "Book", "Happy", "Quickly"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["grammar", "parts of speech", "basics"],
                type: "grammar",
                context: "language structure"
            },
            {
                id: "eng-a1-q3",
                question: "Which is the correct plural form of 'child'?",
                options: ["Childs", "Children", "Childrens", "Child's"],
                correctAnswer: 1,
                difficulty: 2,
                topics: ["grammar", "plurals", "irregular forms"],
                type: "grammar",
                context: "language structure"
            },
            {
                id: "eng-a1-q4",
                question: "Choose the correct sentence:",
                options: ["I am go to school", "I going to school", "I am going to school", "I go to school yesterday"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "eng-a1-q5",
                question: "Which sentence uses the correct article?",
                options: ["I have a apple", "She is an teacher", "He is an engineer", "They bought a umbrella"],
                correctAnswer: 2,
                difficulty: 3
            }
        ],
        a2: [
            {
                id: "eng-a2-q1",
                question: "Which tense is used in 'I have been studying English'?",
                options: ["Present simple", "Present continuous", "Present perfect", "Present perfect continuous"],
                correctAnswer: 3,
                difficulty: 2
            },
            {
                id: "eng-a2-q2",
                question: "Choose the correct sentence for making a suggestion:",
                options: ["Why don't we going to the park?", "Why don't we go to the park?", "Let's to go to the park", "What about to go to the park?"],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "eng-a2-q3",
                question: "What is the past participle of 'speak'?",
                options: ["Spoke", "Speaked", "Spoken", "Speaking"],
                correctAnswer: 2,
                difficulty: 3
            },
            {
                id: "eng-a2-q4",
                question: "Which sentence correctly uses the past continuous?",
                options: ["I was cook when she arrived", "I was cooking when she arrived", "I cooked when she was arriving", "I cooking when she was arrived"],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "eng-a2-q5",
                question: "How do you form a question in the present perfect?",
                options: ["Have you ever visit Paris?", "Have you ever visited Paris?", "Do you ever visited Paris?", "Did you ever visited Paris?"],
                correctAnswer: 1,
                difficulty: 3
            }
        ],
        b1: [
            {
                id: "eng-b1-q1",
                question: "Which is a correct use of the third conditional?",
                options: [
                    "If I study harder, I will pass the exam", 
                    "If I had studied harder, I will pass the exam", 
                    "If I had studied harder, I would have passed the exam", 
                    "If I would study harder, I would pass the exam"
                ],
                correctAnswer: 2,
                difficulty: 3
            },
            {
                id: "eng-b1-q2",
                question: "Identify the correct passive voice of 'They are building a new bridge':",
                options: [
                    "A new bridge is built", 
                    "A new bridge is being built", 
                    "A new bridge has been built", 
                    "A new bridge was built"
                ],
                correctAnswer: 1,
                difficulty: 3
            },
            {
                id: "eng-b1-q3",
                question: "Choose the correct reporting verb for 'She said she was tired':",
                options: ["She told she was tired", "She spoke she was tired", "She mentioned that she was tired", "She asked she was tired"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "eng-b1-q4",
                question: "What does 'I'm fed up with this situation' mean?",
                options: ["I'm happy with this situation", "I'm excited about this situation", "I'm annoyed with this situation", "I'm scared of this situation"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "eng-b1-q5",
                question: "Which word can replace 'big' in formal writing?",
                options: ["Huge", "Substantial", "Massive", "Enormous"],
                correctAnswer: 1,
                difficulty: 2
            }
        ],
        b2: [
            {
                id: "eng-b2-q1",
                question: "Identify the correct use of an inverted conditional:",
                options: [
                    "If I had known, I would have told you", 
                    "Had I known, I would have told you", 
                    "If I knew, I would tell you", 
                    "Did I know, would I tell you"
                ],
                correctAnswer: 1,
                difficulty: 4
            },
            {
                id: "eng-b2-q2",
                question: "Choose the correct phrasal verb: 'We need to _____ this problem immediately.'",
                options: ["deal for", "deal in", "deal with", "deal on"],
                correctAnswer: 2,
                difficulty: 3
            },
            {
                id: "eng-b2-q3",
                question: "Which sentence contains a cleft structure?",
                options: [
                    "What I need is some peace and quiet", 
                    "I really need some peace and quiet", 
                    "Peace and quiet is what I prefer", 
                    "I prefer to have peace and quiet"
                ],
                correctAnswer: 0,
                difficulty: 4
            },
            {
                id: "eng-b2-q4",
                question: "Identify the sentence with correct subject-verb agreement:",
                options: [
                    "The committee have made their decision", 
                    "The committee has made their decision", 
                    "The committee have made its decision", 
                    "The committee has made its decision"
                ],
                correctAnswer: 3,
                difficulty: 3
            },
            {
                id: "eng-b2-q5",
                question: "Which collocation is correct?",
                options: ["make a mistake", "do a mistake", "have a mistake", "take a mistake"],
                correctAnswer: 0,
                difficulty: 3
            }
        ],
        c1: [
            {
                id: "eng-c1-q1",
                question: "Which literary device is used in 'The wind whispered through the trees'?",
                options: ["Simile", "Metaphor", "Personification", "Alliteration"],
                correctAnswer: 2,
                difficulty: 4
            },
            {
                id: "eng-c1-q2",
                question: "What does the idiom 'to bite the bullet' mean?",
                options: [
                    "To act aggressively", 
                    "To face a difficult situation bravely", 
                    "To speak harshly to someone", 
                    "To make a mistake"
                ],
                correctAnswer: 1,
                difficulty: 4
            },
            {
                id: "eng-c1-q3",
                question: "Which is an example of a subjunctive mood?",
                options: [
                    "I wish I was there", 
                    "I wish I were there", 
                    "I wished I was there", 
                    "I have wished I was there"
                ],
                correctAnswer: 1,
                difficulty: 5
            },
            {
                id: "eng-c1-q4",
                question: "Identify the correct academic phrase:",
                options: [
                    "This paper talks about", 
                    "This investigation examines", 
                    "This essay thinks about", 
                    "This study looks at"
                ],
                correctAnswer: 1,
                difficulty: 4
            },
            {
                id: "eng-c1-q5",
                question: "Which transition would best connect two contrasting ideas?",
                options: ["Furthermore", "Similarly", "Nevertheless", "Subsequently"],
                correctAnswer: 2,
                difficulty: 4
            }
        ],
        c2: [
            {
                id: "eng-c2-q1",
                question: "Which of these is NOT a feature of academic writing?",
                options: ["Objectivity", "Formality", "Colloquial expressions", "Precision"],
                correctAnswer: 2,
                difficulty: 5
            },
            {
                id: "eng-c2-q2",
                question: "What rhetorical device is used in 'Ask not what your country can do for you; ask what you can do for your country'?",
                options: ["Anaphora", "Chiasmus", "Epistrophe", "Anadiplosis"],
                correctAnswer: 1,
                difficulty: 5
            },
            {
                id: "eng-c2-q3",
                question: "Choose the most precise synonym for 'ameliorate':",
                options: ["Improve", "Change", "Consider", "Affect"],
                correctAnswer: 0,
                difficulty: 5
            },
            {
                id: "eng-c2-q4",
                question: "Which of the following illustrates synecdoche?",
                options: [
                    "The pen is mightier than the sword", 
                    "All hands on deck", 
                    "The White House made an announcement", 
                    "The wind howled like a wolf"
                ],
                correctAnswer: 1,
                difficulty: 5
            },
            {
                id: "eng-c2-q5",
                question: "What register would be most appropriate for a university dissertation?",
                options: ["Formal academic", "Semi-formal", "Casual", "Conversational"],
                correctAnswer: 0,
                difficulty: 4
            }
        ]
    },    german: {
        a1: [
            {
                id: "ger-a1-q1",
                question: "What is the correct greeting in German for 'Good morning'?",
                options: ["Guten Tag", "Guten Morgen", "Gute Nacht", "Guten Abend"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["greetings", "basics", "social"],
                type: "vocabulary",
                context: "daily communication"
            },
            {
                id: "ger-a1-q2",
                question: "What is the German word for 'thank you'?",
                options: ["Bitte", "Entschuldigung", "Danke", "Willkommen"],
                correctAnswer: 2,
                difficulty: 1,
                topics: ["politeness", "basics", "social"],
                type: "vocabulary",
                context: "daily communication"
            },
            {
                id: "ger-a1-q3",
                question: "Which article is used for the word 'Buch' (book)?",
                options: ["der", "die", "das", "den"],
                correctAnswer: 2,
                difficulty: 2,
                topics: ["grammar", "articles", "gender"],
                type: "grammar",
                context: "language structure"
            },
            {
                id: "ger-a1-q4",
                question: "How do you say 'My name is...' in German?",
                options: ["Wie heißt du", "Ich bin", "Ich heiße", "Mein Name"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "ger-a1-q5",
                question: "Which is the correct counting sequence?",
                options: ["eins, drei, zwei", "eins, zwei, drei", "ein, zwei, drei", "eine, zwei, drei"],
                correctAnswer: 1,
                difficulty: 1
            }
        ],
        a2: [
            {
                id: "ger-a2-q1",
                question: "What is the past participle of 'sehen'?",
                options: ["seht", "gesehen", "sah", "sieht"],
                correctAnswer: 1,
                difficulty: 3
            },
            {
                id: "ger-a2-q2",
                question: "Which is the correct dative form of 'der Mann'?",
                options: ["dem Mann", "den Mann", "der Mann", "des Mannes"],
                correctAnswer: 0,
                difficulty: 3
            },
            {
                id: "ger-a2-q3",
                question: "Choose the correct sentence:",
                options: [
                    "Ich gehe morgen zu Hause", 
                    "Ich gehe morgen nach Hause", 
                    "Ich gehe morgen in Hause", 
                    "Ich gehe morgen bei Hause"
                ],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "ger-a2-q4",
                question: "What is the meaning of 'Es tut mir leid'?",
                options: ["I'm happy", "I'm sorry", "I'm tired", "I'm hungry"],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "ger-a2-q5",
                question: "Which preposition is correct: 'Ich fahre ___ Berlin'?",
                options: ["in", "zu", "nach", "auf"],
                correctAnswer: 2,
                difficulty: 2
            }
        ],
        b1: [
            {
                id: "ger-b1-q1",
                question: "Which conjunction does not change word order in German?",
                options: ["weil", "dass", "und", "obwohl"],
                correctAnswer: 2,
                difficulty: 3
            },
            {
                id: "ger-b1-q2",
                question: "Which case is used after 'mit'?",
                options: ["Nominative", "Accusative", "Dative", "Genitive"],
                correctAnswer: 2,
                difficulty: 3
            }
        ]
    },
    arabic: {
        a1: [
            {
                id: "ara-a1-q1",
                question: "How do you say 'hello' in Arabic?",
                options: ["شكرا", "مع السلامة", "مرحبا", "صباح الخير"],
                correctAnswer: 2,
                difficulty: 1
            },
            {
                id: "ara-a1-q2",
                question: "Which letter is this: 'ب'?",
                options: ["Alif", "Ba", "Ta", "Tha"],
                correctAnswer: 1,
                difficulty: 1
            },
            {
                id: "ara-a1-q3",
                question: "What is the Arabic word for 'book'?",
                options: ["قلم", "كتاب", "باب", "مدرسة"],
                correctAnswer: 1,
                difficulty: 2
            }
        ],
        a2: [
            {
                id: "ara-a2-q1",
                question: "Which is the correct feminine form of 'كبير' (big)?",
                options: ["كبيرة", "كبار", "اكبر", "كبر"],
                correctAnswer: 0,
                difficulty: 2
            },
            {
                id: "ara-a2-q2",
                question: "What does 'كيف حالك؟' mean?",
                options: ["What is your name?", "How are you?", "Where are you from?", "How old are you?"],
                correctAnswer: 1,
                difficulty: 1
            }
        ]
    },
    math: {
        a1: [
            {
                id: "math-a1-q1",
                question: "What is 7 × 8?",
                options: ["15", "56", "64", "72"],
                correctAnswer: 1,
                difficulty: 1
            },
            {
                id: "math-a1-q2",
                question: "Solve: 12 + 9 - 5",
                options: ["16", "26", "6", "14"],
                correctAnswer: 0,
                difficulty: 1
            },
            {
                id: "math-a1-q3",
                question: "What is the value of 3²?",
                options: ["6", "9", "12", "18"],
                correctAnswer: 1,
                difficulty: 1
            },
            {
                id: "math-a1-q4",
                question: "If a triangle has angles of 30° and 60°, what is the third angle?",
                options: ["30°", "60°", "90°", "120°"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "math-a1-q5",
                question: "What fraction of an hour is 15 minutes?",
                options: ["1/2", "1/3", "1/4", "1/5"],
                correctAnswer: 2,
                difficulty: 1
            }
        ],
        a2: [
            {
                id: "math-a2-q1",
                question: "What is the solution to x in the equation 2x + 5 = 15?",
                options: ["5", "7.5", "10", "5/2"],
                correctAnswer: 0,
                difficulty: 2
            },
            {
                id: "math-a2-q2",
                question: "What is the area of a square with sides of length 6cm?",
                options: ["24cm²", "36cm²", "12cm²", "18cm²"],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "math-a2-q3",
                question: "Convert 0.25 to a fraction in its simplest form:",
                options: ["1/2", "1/4", "2/5", "1/5"],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "math-a2-q4",
                question: "If the diameter of a circle is 10cm, what is its circumference? (use π=3.14)",
                options: ["15.7cm", "31.4cm", "78.5cm", "314cm"],
                correctAnswer: 1,
                difficulty: 2
            },
            {
                id: "math-a2-q5",
                question: "What is the prime factorization of 36?",
                options: ["2 × 18", "4 × 9", "6 × 6", "2² × 3²"],
                correctAnswer: 3,
                difficulty: 3
            }
        ],
        b1: [
            {
                id: "math-b1-q1",
                question: "Solve for x: 3x² - 12 = 0",
                options: ["x = ±2", "x = ±4", "x = ±√6", "x = ±√3"],
                correctAnswer: 0,
                difficulty: 3
            },
            {
                id: "math-b1-q2",
                question: "What is the slope of the line passing through points (2,3) and (6,7)?",
                options: ["1/2", "1", "3/2", "2"],
                correctAnswer: 1,
                difficulty: 3
            },
            {
                id: "math-b1-q3",
                question: "If f(x) = x² - 3x + 2, what is f(4)?",
                options: ["6", "10", "14", "18"],
                correctAnswer: 0,
                difficulty: 3
            }
        ]    },
    german: {
        a1: [
            {
                id: "ger-a1-q1",
                question: "What is 'Good morning' in German?",
                options: ["Guten Tag", "Guten Abend", "Guten Morgen", "Gute Nacht"],
                correctAnswer: 2,
                difficulty: 1,
                topics: ["greetings", "basics", "social"],
                type: "vocabulary",
                context: "daily communication"
            },
            {
                id: "ger-a1-q2",
                question: "What is 'Thank you' in German?",
                options: ["Bitte", "Entschuldigung", "Danke", "Tschüss"],
                correctAnswer: 2,
                difficulty: 1,
                topics: ["basics", "social"],
                type: "vocabulary",
                context: "daily communication"
            },
            {
                id: "ger-a1-q3",
                question: "Which article is used for 'woman' (Frau) in German?",
                options: ["der", "die", "das", "den"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["grammar", "articles"],
                type: "grammar"
            },
            {
                id: "ger-a1-q4",
                question: "How do you say 'My name is...' in German?",
                options: ["Ich heiße...", "Du heißt...", "Mein Name...", "Wie heißt du?"],
                correctAnswer: 0,
                difficulty: 1,
                topics: ["introduction", "basics"]
            },
            {
                id: "ger-a1-q5",
                question: "What is the correct way to count from 1 to 3 in German?",
                options: ["ein, zwei, drei", "eins, zwei, drei", "ein, zwo, drei", "erste, zweite, dritte"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["numbers", "basics"]
            }
        ],
        a2: [
            {
                id: "ger-a2-q1",
                question: "Which tense is used in 'Ich habe Deutsch gelernt'?",
                options: ["Present tense", "Simple past", "Perfect tense", "Future tense"],
                correctAnswer: 2,
                difficulty: 2,
                topics: ["grammar", "tenses"]
            },
            {
                id: "ger-a2-q2",
                question: "What is the correct form of 'to be' for 'we' in German?",
                options: ["bin", "bist", "ist", "sind"],
                correctAnswer: 3,
                difficulty: 2,
                topics: ["grammar", "verbs"]
            },
            {
                id: "ger-a2-q3",
                question: "What is the correct plural form of 'das Buch' (the book)?",
                options: ["die Büche", "die Buchen", "die Bücher", "das Bücher"],
                correctAnswer: 2,
                difficulty: 2,
                topics: ["grammar", "plurals"]
            }
        ]
    },
    arabic: {
        a1: [
            {
                id: "ar-a1-q1",
                question: "How many letters are in the Arabic alphabet?",
                options: ["26", "28", "29", "32"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["alphabet", "basics"],
                type: "knowledge"
            },
            {
                id: "ar-a1-q2",
                question: "What is 'Hello' in Arabic?",
                options: ["شكراً", "مرحباً", "مع السلامة", "صباح الخير"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["greetings", "basics"],
                type: "vocabulary"
            },
            {
                id: "ar-a1-q3",
                question: "Which letter comes first in the Arabic alphabet?",
                options: ["ب", "أ", "ت", "ث"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["alphabet", "basics"]
            },
            {
                id: "ar-a1-q4",
                question: "What direction is Arabic written in?",
                options: ["Left to right", "Right to left", "Top to bottom", "Bottom to top"],
                correctAnswer: 1,
                difficulty: 1,
                topics: ["writing", "basics"]
            },
            {
                id: "ar-a1-q5",
                question: "What is the Arabic word for 'book'?",
                options: ["كتاب", "قلم", "مدرسة", "بيت"],
                correctAnswer: 0,
                difficulty: 1,
                topics: ["vocabulary", "objects"]
            }
        ],
        a2: [
            {
                id: "ar-a2-q1",
                question: "What is the dual form of 'كتاب' (book)?",
                options: ["كتب", "كتابان", "كتابين", "كتاب"],
                correctAnswer: 1,
                difficulty: 2,
                topics: ["grammar", "plurals"]
            },
            {
                id: "ar-a2-q2",
                question: "Which of these is a feminine noun in Arabic?",
                options: ["كتاب (book)", "قلم (pen)", "طاولة (table)", "كرسي (chair)"],
                correctAnswer: 2,
                difficulty: 2,
                topics: ["grammar", "gender"]
            },
            {
                id: "ar-a2-q3",
                question: "What is the past tense form of the verb 'to write' for 'I'?",
                options: ["أكتب", "كتبت", "يكتب", "تكتب"],
                correctAnswer: 1,
                difficulty: 2,
                topics: ["grammar", "verbs"]
            }
        ]
    },
    science: {
        a1: [
            {
                id: "sci-a1-q1",
                question: "What is the main function of a microscope?",
                options: [
                    "To magnify small objects", 
                    "To measure temperature", 
                    "To mix chemicals", 
                    "To create electricity"
                ],
                correctAnswer: 0,
                difficulty: 1
            },
            {
                id: "sci-a1-q2",
                question: "Which of these is NOT a step in the scientific method?",
                options: ["Making observations", "Forming a hypothesis", "Publishing results without testing", "Analyzing data"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "sci-a1-q3",
                question: "What does pH measure?",
                options: ["Pressure", "Temperature", "Acidity/alkalinity", "Weight"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "sci-a1-q4",
                question: "Which state of matter has the highest energy?",
                options: ["Solid", "Liquid", "Gas", "Plasma"],
                correctAnswer: 3,
                difficulty: 2
            },
            {
                id: "sci-a1-q5",
                question: "What is the Earth's primary source of energy?",
                options: ["The Moon", "The Sun", "Wind", "Water"],
                correctAnswer: 1,
                difficulty: 1
            }
        ],
        a2: [
            {
                id: "sci-a2-q1",
                question: "What is the basic structural unit of all living organisms?",
                options: ["Atom", "Tissue", "Cell", "Organ"],
                correctAnswer: 2,
                difficulty: 1
            },
            {
                id: "sci-a2-q2",
                question: "Which organelle is responsible for photosynthesis in plant cells?",
                options: ["Nucleus", "Mitochondria", "Chloroplast", "Ribosome"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "sci-a2-q3",
                question: "What is homeostasis?",
                options: [
                    "The study of fossils", 
                    "The process of maintaining a stable internal environment", 
                    "The evolution of species", 
                    "The classification of organisms"
                ],
                correctAnswer: 1,
                difficulty: 3
            },
            {
                id: "sci-a2-q4",
                question: "Which of these is an ecosystem?",
                options: ["A single tree", "A frog", "A forest", "A plant cell"],
                correctAnswer: 2,
                difficulty: 1
            },
            {
                id: "sci-a2-q5",
                question: "What is the role of decomposers in an ecosystem?",
                options: [
                    "They produce food through photosynthesis", 
                    "They eat plants", 
                    "They break down dead organisms", 
                    "They regulate the population"
                ],
                correctAnswer: 2,
                difficulty: 2
            }
        ],
        b1: [
            {
                id: "sci-b1-q1",
                question: "Which law states that energy cannot be created or destroyed?",
                options: [
                    "Newton's First Law", 
                    "Law of Conservation of Mass", 
                    "Law of Conservation of Energy", 
                    "Law of Thermodynamics"
                ],
                correctAnswer: 2,
                difficulty: 3
            },
            {
                id: "sci-b1-q2",
                question: "What is the formula for acceleration?",
                options: ["a = m/F", "a = F/m", "a = d/t", "a = v/t"],
                correctAnswer: 1,
                difficulty: 3
            },
            {
                id: "sci-b1-q3",
                question: "Which element has the chemical symbol 'Fe'?",
                options: ["Fluorine", "Helium", "Iron", "Francium"],
                correctAnswer: 2,
                difficulty: 2
            },
            {
                id: "sci-b1-q4",
                question: "What is the chemical formula for water?",
                options: ["H2O", "CO2", "O2", "H2O2"],
                correctAnswer: 0,
                difficulty: 1
            },
            {
                id: "sci-b1-q5",
                question: "In which state of matter are molecules arranged in a fixed pattern?",
                options: ["Solid", "Liquid", "Gas", "All of the above"],
                correctAnswer: 0,
                difficulty: 1
            }
        ]
    }
};

// User-specific question history
let UserQuestionHistory = {};

// Export to make available to other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuestionsData, UserQuestionHistory };
}

// C2 Chapter Interactive Question Handling
document.addEventListener('DOMContentLoaded', function() {
  // Modal elements
  const modal = document.getElementById('questionModal');
  const titleEl = document.getElementById('modalSkillTitle');
  const questEl = document.getElementById('modalQuestion');
  const ansEl = document.getElementById('modalAnswer');
  const prevBtn = document.getElementById('prevQuestion');
  const nextBtn = document.getElementById('nextQuestion');
  const checkBtn = document.getElementById('checkAnswer');
  const feedbackEl = document.getElementById('modalFeedback');
  
  // Skill question sets
  const skills = {
    'idioms': [
      { q: 'What does "break the ice" mean?', a: 'to make people feel more comfortable in a social situation' },
      { q: 'What does "hit the books" mean?', a: 'to study' },
      { q: 'What does "once in a blue moon" mean?', a: 'very rarely' }
    ],
    'advanced-grammar': [
      { q: 'Rewrite using inversion: "I have never seen such a beautiful view."', a: 'never have I seen such a beautiful view' },
      { q: 'Create a cleft sentence with "It was": "John found the solution."', a: 'it was John who found the solution' }
    ],
    'discourse-markers': [
      { q: 'Which discourse marker shows contrast?', a: 'however' },
      { q: 'Which discourse marker shows addition?', a: 'furthermore' }
    ],
    'complex-topics': [
      { q: 'Use three advanced expressions to discuss climate change.', a: 'open-ended' },
      { q: 'Use formal language to propose a solution to a social problem.', a: 'open-ended' }
    ]
  };
  
  let currentSkill = null, currentIndex = 0;
  
  document.querySelectorAll('.skill-btn').forEach(btn => btn.addEventListener('click', ()=>{
    currentSkill = btn.dataset.skill;
    currentIndex = 0;
    titleEl.textContent = btn.textContent;
    loadQuestion();
    modal.classList.remove('hidden');
  }));
  
  document.getElementById('closeModal').addEventListener('click', ()=> modal.classList.add('hidden'));
  
  prevBtn.addEventListener('click', ()=>{
    if(currentIndex>0) currentIndex--, loadQuestion();
  });
  
  nextBtn.addEventListener('click', ()=>{
    const total = skills[currentSkill].length;
    if(currentIndex<total-1) currentIndex++ , loadQuestion();
    else modal.classList.add('hidden');
  });
  
  function loadQuestion(){
    const item = skills[currentSkill][currentIndex];
    questEl.textContent = item.q;
    ansEl.value = '';
    feedbackEl.textContent = '';
    feedbackEl.classList.add('hidden');
    prevBtn.disabled = currentIndex===0;
    nextBtn.disabled = true;
  }
  
  checkBtn.addEventListener('click', ()=>{
    const currentQuestion = skills[currentSkill][currentIndex];
    feedbackEl.classList.remove('hidden');
    
    if(currentQuestion.a === 'open-ended') {
      // For open-ended questions, just allow proceeding
      feedbackEl.textContent = 'Response recorded!'; 
      feedbackEl.className='mt-4 text-green-600 font-semibold';
      nextBtn.disabled = false;
    } else {
      // For questions with specific answers
      const correct = currentQuestion.a.toLowerCase();
      if(ansEl.value.trim().toLowerCase() === correct || 
          ansEl.value.trim().toLowerCase().includes(correct)){
        feedbackEl.textContent = '✓ Correct!'; 
        feedbackEl.className='mt-4 text-green-600 font-semibold';
        nextBtn.disabled = false;
        
        // Update progress in localStorage per skill
        const progressKey = `c2_${currentSkill}_prog`;
        let prog = JSON.parse(localStorage.getItem(progressKey)||'[]');
        prog[currentIndex] = true;
        localStorage.setItem(progressKey, JSON.stringify(prog));
      } else {
        feedbackEl.textContent = '✗ Try again!'; 
        feedbackEl.className='mt-4 text-red-600 font-semibold';
      }
    }
  });
  
  // Enable answering by pressing Enter
  ansEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkBtn.click();
    }
  });
});

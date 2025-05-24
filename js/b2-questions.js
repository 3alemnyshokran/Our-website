// B2 Chapter Interactive Question Handling
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
    'modal-verbs': [
      { q: 'Which modal verb is used for obligation?', a: 'must' },
      { q: 'Which modal verb is used for possibility?', a: 'might' }
    ],
    'debate': [
      { q: 'Complete: "I see your point, but I have to _______."', a: 'disagree' },
      { q: 'What phrase can you use to introduce a contrasting opinion?', a: 'on the other hand' }
    ],
    'opinions': [
      { q: 'Complete: "In my opinion, _______"', a: 'open-ended' },
      { q: 'What phrase shows strong disagreement?', a: 'I strongly disagree' }
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
        const progressKey = `b2_${currentSkill}_prog`;
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

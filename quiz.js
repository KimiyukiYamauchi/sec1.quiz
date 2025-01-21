const incorrectQuestions = [];
const incorrectAnswers = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedQuiz = [];

// クイズデータをフェッチ
async function fetchQuiz() {
  const response = await fetch('quiz.json');
  return await response.json();
}

// 配列をシャッフルする関数
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// モード選択時の処理
document.getElementById('normal-mode').addEventListener('click', async () => {
  selectedQuiz = await fetchQuiz();
  startQuiz(selectedQuiz);
});

document.getElementById('random-mode').addEventListener('click', () => {
  document.getElementById('random-options').style.display = 'block';
});

document.getElementById('start-random').addEventListener('click', async () => {
  const totalQuestions = parseInt(document.getElementById('random-count').value);
  if (isNaN(totalQuestions) || totalQuestions < 1) {
    alert('正しい問題数を入力してください');
    return;
  }
  const allQuestions = await fetchQuiz();
  shuffleArray(allQuestions);
  selectedQuiz = allQuestions.slice(0, totalQuestions);
  startQuiz(selectedQuiz);
});

// クイズを開始
function startQuiz(quiz) {
  document.getElementById('mode-selection').style.display = 'none';
  document.getElementById('quiz-wrapper').style.display = 'block';
  currentQuestionIndex = 0;
  score = 0;
  displayQuestion(quiz);
}

// クイズの進捗を更新
function updateProgress(current, total) {
  const progressElement = document.getElementById('progress');
  progressElement.textContent = `${current}問目/${total}問中`;
}

// 質問を表示
function displayQuestion(quiz) {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  const questionData = quiz[currentQuestionIndex];
  // console.log(questionData);

  // 進捗更新
  updateProgress(currentQuestionIndex + 1, quiz.length);

  // 質問表示
  const questionElement = document.createElement('h2');
  questionElement.textContent = questionData.question;
  quizContainer.appendChild(questionElement);

  // 選択肢表示
  questionData.choices.forEach((choice, index) => {
    const label = document.createElement('label');
    label.style.display = 'block';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = choice;
    checkbox.name = 'choice';
    checkbox.id = `choice-${index}`;
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(choice));
    
    quizContainer.appendChild(label);
  });

  // OKボタン(選択肢の確定処理)
  const okButton = document.createElement('button');
  okButton.id = 'ok-button';
  okButton.textContent = 'OK';
  okButton.style.marginTop = '20px';
  quizContainer.appendChild(okButton);

  okButton.onclick = () => {
    // console.log(questionData);
    handleAnswer(questionData.answer, questionData.explanation, quiz);
    okButton.style.display = 'none'; // OKボタンを非表示
  };

  // フィードバックエリア
  const feedbackElement = document.createElement('div');
  feedbackElement.id = 'feedback';
  feedbackElement.style.marginTop = '20px';
  quizContainer.appendChild(feedbackElement);
}

// 現在のスコアを表示する関数
function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('score-display');
  scoreDisplay.textContent = `${score}問正解`;
}

// 回答を処理
function handleAnswer(correctAnswers, explanation, quiz) {
  const selectedChoices = Array.from(document.querySelectorAll('input[name="choice"]:checked')).map(input => input.value);
  const feedbackElement = document.getElementById('feedback');
  const nextButton = document.getElementById('next-question');

  // 正答判定
  const isCorrect = correctAnswers.every(answer => selectedChoices.includes(answer)) &&
                    selectedChoices.every(choice => correctAnswers.includes(choice));

  // ボタンの無効化
  document.querySelectorAll('input[name="choice"]').forEach(input => input.disabled = true);

  if (isCorrect) {
    feedbackElement.textContent = '正解！';
    feedbackElement.style.color = 'green';
    score++;
    updateScoreDisplay();
  } else {
    feedbackElement.textContent = `不正解！正解は「${correctAnswers.join(', ')}」です。`;
    feedbackElement.style.color = 'red';
    incorrectQuestions.push(quiz[currentQuestionIndex]);
  }

  // 解説表示
  const explanationElement = document.createElement('div');
  explanationElement.innerHTML = `解説: ${explanation.replace(/\n/g, '<br>')}`;
  feedbackElement.appendChild(explanationElement);

  currentQuestionIndex++;
  if (currentQuestionIndex < quiz.length) {
    nextButton.textContent = '次へ';
    nextButton.style.display = 'block';
    nextButton.onclick = () => {
      displayQuestion(quiz);
      nextButton.style.display = 'none';  
    }
  } else {
    nextButton.textContent = '確認';
    nextButton.style.display = 'block';
    nextButton.onclick = displayFinalScore;
  }
}

// 最終スコアを表示
function displayFinalScore() {
  const quizWrapper = document.getElementById('quiz-wrapper');
  const totalQuestions = incorrectQuestions.length + score; // 全問題数
  const accuracy = ((score / totalQuestions) * 100).toFixed(2); // 正解率を計算（小数点2桁まで）

  quizWrapper.innerHTML = `
    <h2>結果発表</h2>
    <p>正解率: ${accuracy}%</p>
  `;

  if (incorrectQuestions.length > 0) {
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>No.</th>
          <th>問題</th>
          <th>正解</th>
        </tr>
      </thead>
      <tbody>
        ${incorrectQuestions
          .map((question) => `
            <tr>
              <td>${question.questionNumber}</td>
              <td>${question.question}</td>
              <td>${question.answer}</td>
            </tr>
          `)
          .join('')}
      </tbody>
    `;
    quizWrapper.appendChild(table);
  }
}

// 初期化
(async function initQuiz() {
  await fetchQuiz();
})();

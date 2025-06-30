const incorrectQuestions = [];
const incorrectAnswers = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedQuiz = [];
let currentChapter = ""; // 現在の章
let currentMode = ""; // 現在のモード

// クイズデータをフェッチ
async function fetchQuiz() {
  try {
    const response = await fetch("quiz.json");
    if (!response.ok) {
      throw new Error("クイズデータの取得に失敗しました");
    }
    return await response.json();
  } catch (error) {
    alert(
      "クイズデータの取得に失敗しました。ネットワーク接続やファイルの場所を確認してください。"
    );
    console.error(error);
  }
}

// 章ボタン表示
async function generateChapterOptions() {
  const quizData = await fetchQuiz();
  const chapters = [...new Set(quizData.map((item) => item.chapter))];

  const chapterSelectionContainer =
    document.getElementById("chapter-selection");

  // 章ボタン専用コンテナのクリア
  let buttonsContainer =
    chapterSelectionContainer.querySelector("#chapter-buttons");
  if (!buttonsContainer) {
    buttonsContainer = document.createElement("div");
    buttonsContainer.id = "chapter-buttons";
  } else {
    buttonsContainer.innerHTML = "";
  }

  // 各章ごとに、ボタンと正解率表示をまとめたコンテナを生成
  chapters.forEach((chapter) => {
    // コンテナ作成（ボタンと正解率表示を横並びにする）
    const chapterContainer = document.createElement("div");
    chapterContainer.className = "chapter-container";

    // 章選択ボタン
    const button = document.createElement("button");
    button.className = "chapter-button";
    button.textContent = chapter;
    button.onclick = () => showModeSelection(quizData, chapter);
    chapterContainer.appendChild(button);

    // 正解率表示用 span
    const accuracyHidden = document.createElement("span");
    accuracyHidden.className = "chapter-rate-hidden";
    accuracyHidden.style.display = "none"; // 非表示

    // ローカルストレージから保存された正解率を取得
    const currentChapter = chapter.split(" ")[0]; // 章番号のみ取得
    const storedAccuracy = localStorage.getItem("quiz-" + currentChapter);
    // console.log('quiz-' + currentChapter + " = " + storedAccuracy)

    if (storedAccuracy !== null) {
      if (parseFloat(storedAccuracy) === 100) {
        accuracyHidden.textContent = "パーフェクト";
      } else {
        accuracyHidden.textContent = storedAccuracy + "%";
        if (parseFloat(storedAccuracy) >= 80) {
          // 80%以上なら緑色のチェックマークを追加
          const checkMark = document.createElement("span");
          checkMark.textContent = " ✓";
          checkMark.style.color = "green";
          accuracyHidden.appendChild(checkMark);
        }
      }
    }
    chapterContainer.appendChild(accuracyHidden);

    // コンテナをボタン群のコンテナに追加
    buttonsContainer.appendChild(chapterContainer);
  });

  // 「すべての問題」ボタンを追加
  const allContainer = document.createElement("div");
  allContainer.className = "chapter-container";
  const allButton = document.createElement("button");
  allButton.className = "chapter-button all-button";
  allButton.textContent = "all すべての問題";
  allButton.onclick = () => showModeSelection(quizData, "all");
  allContainer.appendChild(allButton);

  // allボタン用のhiddenな正解率情報
  const allAccuracyHidden = document.createElement("span");
  allAccuracyHidden.className = "chapter-rate-hidden";
  allAccuracyHidden.style.display = "none"; // 非表示
  const storedAccuracyAll = localStorage.getItem("quiz-all");
  if (storedAccuracyAll !== null) {
    if (parseFloat(storedAccuracyAll) === 100) {
      allAccuracyHidden.textContent = "パーフェクト";
    } else {
      allAccuracyHidden.textContent = storedAccuracyAll + "%";
      if (parseFloat(storedAccuracyAll) >= 80) {
        allAccuracyHidden.textContent += " ✓";
      }
    }
  }
  allContainer.appendChild(allAccuracyHidden);
  buttonsContainer.appendChild(allContainer);

  chapterSelectionContainer.appendChild(buttonsContainer);
}

// モードボタン表示
function showModeSelection(quizData, chapter) {
  document.getElementById("chapter-selection").style.display = "none";
  document.getElementById("mode-selection").style.display = "block";

  document.getElementById("normal-mode").onclick = () =>
    startQuizForChapter(quizData, chapter, false);
  document.getElementById("random-mode").onclick = () =>
    startQuizForChapter(quizData, chapter, true);
}

// 章とモードを表示
function updateChapterModeDisplay(chapter, mode) {
  const chapterModeDisplay = document.getElementById("chapter-mode-display");

  currentChapter = chapter.split(" ")[0]; // 章番号のみ取得
  currentMode = mode;
  chapterModeDisplay.textContent = `${currentChapter} > ${currentMode}`;
}

// 配列をシャッフルする関数
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// クイズを開始
function startQuiz(quiz) {
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("quiz-wrapper").style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  displayQuestion(quiz);
}

// モードに応じて問題を出題
function startQuizForChapter(quizData, chapter, isRandom) {
  let filteredQuiz;
  const mode = isRandom ? "ランダム" : "通常";

  if (chapter === "all") {
    filteredQuiz = quizData; // すべての問題を取得
  } else {
    filteredQuiz = quizData.filter((item) => item.chapter === chapter); // 章ごとに取得
  }

  // チャプターとモードを表示
  updateChapterModeDisplay(chapter, mode);

  if (isRandom) {
    shuffleArray(filteredQuiz); // ランダムに並べ替える
  }

  startQuiz(filteredQuiz);
}

// クイズの進捗を更新
function updateProgress(current, total) {
  const progressElement = document.getElementById("progress");
  progressElement.textContent = `${current}問目/${total}問中`;
}

// テキストを整形
function formatText(text) {
  return text
    .replace(/\n/g, "<br>") // 改行を <br> に置き換える
    .replace(/ /g, "&nbsp;"); // 半角スペースを &nbsp; に置き換える
}

// 質問を表示
function displayQuestion(quiz) {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "";

  const questionData = quiz[currentQuestionIndex];
  // console.log(questionData);

  // 進捗更新
  updateProgress(currentQuestionIndex + 1, quiz.length);

  // 質問表示
  const questionElement = document.createElement("h2");
  questionElement.innerHTML = formatText(questionData.question);
  quizContainer.appendChild(questionElement);

  // 現在の問題番号をhidden inputで保持
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.id = "question-number";
  hiddenInput.value = questionData.questionNumber;
  quizContainer.appendChild(hiddenInput);

  // ランダムモードなら選択肢をシャッフル
  let choices = [...questionData.choices];
  if (currentMode === "ランダム") {
    shuffleArray(choices);
  }

  // 選択肢表示
  choices.forEach((choice, index) => {
    const label = document.createElement("label");
    label.style.display = "block";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = choice;
    checkbox.name = "choice";
    checkbox.id = `choice-${index}`;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        label.classList.add("selected-choice");
      } else {
        label.classList.remove("selected-choice");
      }
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(choice));

    quizContainer.appendChild(label);
  });

  // OKボタン(選択肢の確定処理)
  const okButton = document.createElement("button");
  okButton.id = "ok-button";
  okButton.textContent = "OK";
  okButton.style.marginTop = "20px";
  quizContainer.appendChild(okButton);

  okButton.onclick = () => {
    // console.log(questionData);
    handleAnswer(questionData.answer, questionData.explanation, quiz);
    okButton.style.display = "none"; // OKボタンを非表示
  };

  // フィードバックエリア
  const feedbackElement = document.createElement("div");
  feedbackElement.id = "feedback";
  feedbackElement.style.marginTop = "20px";
  quizContainer.appendChild(feedbackElement);
}

// 現在のスコアを表示する関数
function updateScoreDisplay() {
  const scoreDisplay = document.getElementById("score-display");
  scoreDisplay.textContent = `${score}問正解`;
}

// 回答を処理
function handleAnswer(correctAnswers, explanation, quiz) {
  const selectedChoices = Array.from(
    document.querySelectorAll('input[name="choice"]:checked')
  ).map((input) => input.value);
  const feedbackElement = document.getElementById("feedback");
  const nextButton = document.getElementById("next-question");

  // 正答判定
  const isCorrect =
    correctAnswers.every((answer) => selectedChoices.includes(answer)) &&
    selectedChoices.every((choice) => correctAnswers.includes(choice));

  // ボタンの無効化
  document
    .querySelectorAll('input[name="choice"]')
    .forEach((input) => (input.disabled = true));

  if (isCorrect) {
    feedbackElement.textContent = "正解！";
    feedbackElement.style.color = "green";
    score++;
    updateScoreDisplay();
  } else {
    feedbackElement.textContent = `不正解！正解は「${correctAnswers.join(
      ", "
    )}」です。`;
    feedbackElement.style.color = "red";
    incorrectQuestions.push(quiz[currentQuestionIndex]);
  }

  // 解説表示
  const explanationElement = document.createElement("div");
  explanationElement.innerHTML = `${formatText(explanation)}`;
  feedbackElement.appendChild(explanationElement);

  currentQuestionIndex++;
  if (currentQuestionIndex < quiz.length) {
    nextButton.textContent = "次へ";
    nextButton.style.display = "block";
    nextButton.onclick = () => {
      displayQuestion(quiz);
      nextButton.style.display = "none";
    };
  } else {
    nextButton.textContent = "確認";
    nextButton.style.display = "block";
    nextButton.onclick = displayFinalScore;
  }
}

// 最終スコアを表示
function displayFinalScore() {
  const quizWrapper = document.getElementById("quiz-wrapper");
  const totalQuestions = incorrectQuestions.length + score; // 全問題数
  const accuracy = ((score / totalQuestions) * 100).toFixed(2); // 正解率を計算（小数点2桁まで）

  // ローカルストレージに章ごとに保存（上書きの場合）
  // "ランダム"モードの場合のみローカルストレージに保存する
  if (currentMode === "ランダム") {
    const key =
      currentChapter === "all" ? "quiz-all" : "quiz-" + currentChapter;
    const storedAccuracy = localStorage.getItem(key);
    // 保存されていない場合または新しい正解率が既存より大きい場合に保存
    if (
      storedAccuracy === null ||
      parseFloat(accuracy) > parseFloat(storedAccuracy)
    ) {
      localStorage.setItem(key, accuracy);
    }
  }

  quizWrapper.innerHTML = `
    <h2 style="margin: 0;">結果発表</h2>
    <div style="display: flex; justify-content: space-between; align-items: center;">
       <span>${currentChapter} > ${currentMode}</span>
        <span>正解率: ${accuracy}%</span>
    </div>
  `;

  if (incorrectQuestions.length > 0) {
    const table = document.createElement("table");
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
          .map(
            (question) => `
            <tr>
              <td>${question.questionNumber}</td>
              <td>${question.question}</td>
              <td>${question.answer}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    `;
    quizWrapper.appendChild(table);
  }
}

// ページ読み込み時に章ボタンを表示
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMが読み込まれました");
  await generateChapterOptions();
});

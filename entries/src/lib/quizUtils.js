import { getGrade } from "./constants";

export const calculateResults = (questions, userAnswers, timeTaken) => {
  let correct = 0;
  const answersData = questions.map((q, idx) => {
    const selected = userAnswers[idx];
    const isCorrect = selected === q.correct_answer;
    if (isCorrect) correct++;
    return {
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      selected_answer: selected || "—",
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      explanation: q.explanation || "No explanation provided.",
    };
  });

  const total = questions.length;
  const wrong = total - correct;
  const percentage = Math.round((correct / total) * 100);
  const gradeInfo = getGrade(percentage);

  return {
    total_questions: total,
    correct_answers: correct,
    wrong_answers: wrong,
    score_percentage: percentage,
    grade: gradeInfo.grade,
    remark: gradeInfo.remark,
    gradeColor: gradeInfo.color,
    time_taken_seconds: timeTaken,
    answers_data: answersData,
  };
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const isSubscriptionActive = (profile) => {
  if (!profile) return false;
  if (profile.subscription_plan === "free") return false;
  if (!profile.subscription_expires) return false;
  return new Date(profile.subscription_expires) > new Date();
};

export const canTakeQuiz = (profile, difficulty) => {
  const isPaid = isSubscriptionActive(profile);
  if (isPaid) return { allowed: true };

  if (difficulty !== "Easy") {
    return { allowed: false, reason: "Medium and Hard levels require a paid subscription." };
  }

  const today = new Date().toISOString().split("T")[0];
  const resetDate = profile?.daily_reset_date;
  const used = resetDate === today ? (profile?.daily_questions_used || 0) : 0;

  if (used >= 3) {
    return { allowed: false, reason: "You've used your 3 free quiz trials for today. Come back tomorrow or upgrade for unlimited access." };
  }

  return { allowed: true, quizzesLeft: 3 - used };
};
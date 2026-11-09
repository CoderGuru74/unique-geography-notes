"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Flag, ShieldCheck, Trophy, RotateCcw } from "lucide-react";

export default function CbtTestRunner({ testTitle, questions = [], durationMinutes = 60, onFinish }) {
  const router = useRouter();

  // Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);

  // Countdown Timer Engine
  useEffect(() => {
    if (isExamSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExamSubmitted]);

  // Format Timer Display (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSelectOption = (optionIndex) => {
    if (isExamSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const toggleMarkForReview = () => {
    setMarkedForReview({
      ...markedForReview,
      [currentQuestionIndex]: !markedForReview[currentQuestionIndex],
    });
  };

  // Submit & Calculate Final Score
  const handleSubmitExam = () => {
    let totalMarksObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (userAns === undefined) {
        unattemptedCount++;
      } else if (userAns === q.correctAnswer) {
        correctCount++;
        totalMarksObtained += q.marks || 2; // Default 2 marks per question
      } else {
        incorrectCount++;
        // Optional: Deduct negative marking if required (e.g. -0.5)
      }
    });

    const totalPossibleMarks = questions.reduce((acc, q) => acc + (q.marks || 2), 0);
    const percentage = Math.round((totalMarksObtained / totalPossibleMarks) * 100);

    setTestScore({
      totalMarksObtained,
      totalPossibleMarks,
      percentage,
      correctCount,
      incorrectCount,
      unattemptedCount,
      totalQuestions: questions.length,
    });

    setIsExamSubmitted(true);
    if (onFinish) onFinish();
  };

  const currentQ = questions[currentQuestionIndex];

  // SCORECARD SCREEN (Rendered after Submission)
  if (isExamSubmitted && testScore) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-gray-200 text-slate-900">
        <div className="text-center pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Live Exam Result &amp; Scorecard</h2>
          <p className="text-xs font-bold text-slate-500 mt-1">{testTitle}</p>
        </div>

        {/* Score Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-center">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-blue-700 block">Marks Obtained</span>
            <span className="text-2xl font-black text-slate-900">{testScore.totalMarksObtained} / {testScore.totalPossibleMarks}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-emerald-700 block">Score Percentage</span>
            <span className="text-2xl font-black text-emerald-700">{testScore.percentage}%</span>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-green-700 block">Correct</span>
            <span className="text-2xl font-black text-green-700">{testScore.correctCount}</span>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-red-700 block">Incorrect</span>
            <span className="text-2xl font-black text-red-700">{testScore.incorrectCount}</span>
          </div>
        </div>

        {/* Question Solutions Review */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Detailed Question Solutions:</h3>
          {questions.map((q, idx) => {
            const userAns = selectedAnswers[idx];
            const isCorrect = userAns === q.correctAnswer;
            const isUnattempted = userAns === undefined;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${
                  isCorrect
                    ? "bg-emerald-50/50 border-emerald-200"
                    : isUnattempted
                    ? "bg-slate-50 border-gray-200"
                    : "bg-red-50/50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-700">Q{idx + 1}.</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      isCorrect
                        ? "bg-emerald-200 text-emerald-900"
                        : isUnattempted
                        ? "bg-slate-200 text-slate-700"
                        : "bg-red-200 text-red-900"
                    }`}
                  >
                    {isCorrect ? "CORRECT (+2)" : isUnattempted ? "UNATTEMPTED (0)" : "INCORRECT (0)"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mb-3">{q.questionText}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2 rounded-xl border ${
                        optIdx === q.correctAnswer
                          ? "bg-emerald-100 border-emerald-400 font-bold text-emerald-900"
                          : optIdx === userAns
                          ? "bg-red-100 border-red-400 font-bold text-red-900"
                          : "bg-white border-gray-200 text-slate-600"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/category/exams")}
            className="bg-[#0B2545] text-amber-400 font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-900 transition"
          >
            Return to Exam Portal
          </button>
        </div>
      </div>
    );
  }

  // LIVE CBT EXAM INTERFACE (During Test)
  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans select-none">
      {/* Top CBT Header & Live Timer */}
      <header className="bg-[#0B2545] text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Live CBT Examination</span>
          <h1 className="text-sm font-black text-white line-clamp-1">{testTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 font-mono text-sm font-black">
            <Clock className="w-4 h-4 animate-pulse text-amber-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to submit your examination now?")) {
                handleSubmitExam();
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="max-w-[1400px] mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Active Question */}
        <div className="flex-1 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <button
                onClick={toggleMarkForReview}
                className={`text-xs font-bold px-3 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                  markedForReview[currentQuestionIndex]
                    ? "bg-purple-100 text-purple-900 border-purple-300"
                    : "bg-slate-50 text-slate-600 border-gray-200 hover:bg-slate-100"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQuestionIndex] ? "Marked for Review" : "Mark for Review"}</span>
              </button>
            </div>

            {/* Question Statement */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-6">
              {currentQ?.questionText}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ?.options?.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "border-[#0B2545] bg-blue-50/50 ring-2 ring-[#0B2545]/10 font-bold"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? "border-[#0B2545] bg-[#0B2545] text-white" : "border-slate-300 text-slate-600"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-xs sm:text-sm text-slate-800">{optionText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <button
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="px-5 py-2 bg-[#0B2545] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer hover:bg-slate-900"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Question Palette Grid */}
        <div className="w-full lg:w-80 bg-white rounded-3xl p-5 border border-gray-200 shadow-xs h-fit space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-gray-100">
            Question Palette
          </h4>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const isAttempted = selectedAnswers[idx] !== undefined;
              const isMarked = markedForReview[idx];
              const isCurrent = currentQuestionIndex === idx;

              let colorStyle = "bg-slate-100 text-slate-700 border-gray-200";
              if (isCurrent) colorStyle = "ring-2 ring-amber-500 font-black";
              if (isAttempted) colorStyle += " bg-emerald-600 text-white border-emerald-700";
              else if (isMarked) colorStyle += " bg-purple-600 text-white border-purple-700";

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center ${colorStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600"></span> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-600"></span> Marked for Review
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-gray-300"></span> Not Answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
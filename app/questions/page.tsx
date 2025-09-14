'use client';

import { useEffect, useState } from 'react';

type Question = {
  id: number;
  subject: string;
  grade: number;
  content: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  createdAt: string;
};

const GAME_DURATION = 60; // seconds

export default function TimedQuizPage() {
  const [subject, setSubject] = useState('biology');
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<null | 'A' | 'B' | 'C' | 'D'>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (started && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setStarted(false);
    }

    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const startGame = async () => {
    setStarted(true);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setGameOver(false);
    setSelected(null);
    setIsCorrect(null);
    await loadNextQuestion();
  };

  const loadNextQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    setQuestion(null);

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, grade: 7 }),
    });

    const data = await res.json();
    setQuestion(data.question);
    setLoading(false);
  };

  const handleAnswer = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (!question || selected) return;

    setSelected(choice);
    const correct = choice === question.correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      if (timeLeft > 0) loadNextQuestion();
    }, 1000); // delay before next question
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Timed Science Quiz (Grade 7)</h1>

      {!started && !gameOver && (
        <div className="mb-4">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject (e.g., biology)"
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
          <button
            onClick={startGame}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Start Quiz
          </button>
        </div>
      )}

      {started && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-lg font-medium">⏱ Time Left: {timeLeft}s</div>
          <div className="text-lg font-medium">✅ Score: {score}</div>
        </div>
      )}

      {question && started && (
        <div className="mt-4 border p-4 rounded shadow-sm bg-white">
          <p className="font-medium text-lg mb-4">{question.content}</p>
          {(['A', 'B', 'C', 'D'] as const).map((letter) => {
            const choiceText = question[`choice${letter}` as keyof Question];
            const isSelected = selected === letter;
            const isCorrectAnswer = question.correctAnswer === letter;

            let bgColor = 'bg-gray-100';
            if (selected) {
              if (isSelected && isCorrectAnswer) bgColor = 'bg-green-200';
              else if (isSelected && !isCorrectAnswer) bgColor = 'bg-red-200';
              else if (isCorrectAnswer) bgColor = 'bg-green-100';
            }

            return (
              <button
                key={letter}
                onClick={() => handleAnswer(letter)}
                disabled={!!selected}
                className={`block w-full text-left p-3 mb-2 rounded ${bgColor} border hover:bg-gray-200 disabled:cursor-not-allowed`}
              >
                <strong>{letter}.</strong> {choiceText}
              </button>
            );
          })}

          {selected && (
            <p className="mt-3 font-semibold">
              {isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
            </p>
          )}
        </div>
      )}

      {gameOver && (
        <div className="mt-6 border p-4 bg-yellow-50 rounded shadow">
          <h2 className="text-xl font-bold mb-2">⏰ Time's Up!</h2>
          <p className="mb-2">Your score: <strong>{score}</strong></p>
          <button
            onClick={startGame}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

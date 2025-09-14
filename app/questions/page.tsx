'use client';

import { useState } from 'react';

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

export default function QuestionPage() {
  const [subject, setSubject] = useState('biology');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<null | 'A' | 'B' | 'C' | 'D'>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    setQuestion(null);

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, grade: 7 }),
    });

    const data = await res.json();

    if (data?.question) {
      setQuestion(data.question);
    }

    setLoading(false);
  };

  const handleAnswer = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (!question) return;
    setSelected(choice);
    setIsCorrect(choice === question.correctAnswer);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Grade 7 Science Questions</h1>

      <div className="mb-4">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject (e.g., biology)"
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <button
        onClick={generateQuestion}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Question'}
      </button>

      {question && (
        <div className="mt-6 border p-4 rounded shadow-sm bg-white">
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
            <p className="mt-4 font-semibold">
              {isCorrect ? '✅ Correct!' : '❌ Incorrect.'} The correct answer is{' '}
              <strong>{question.correctAnswer}</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

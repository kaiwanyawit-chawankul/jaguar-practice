// app/api/questions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from 'db';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { subject, grade } = await req.json();

    const prompt = `
Generate a multiple-choice science question suitable for a grade ${grade} student on the topic "${subject}".
Return the result in **exactly** this JSON format (no markdown):

{
  "question": "Your question here?",
  "choices": {
    "A": "Choice A",
    "B": "Choice B",
    "C": "Choice C",
    "D": "Choice D"
  },
  "correctAnswer": "A"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // or your preferred model
      contents: prompt,
    });

    const rawText = response.text || '';
    const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('AI response did not return valid JSON.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const saved = await prisma.question.create({
      data: {
        subject,
        grade,
        content: parsed.question,
        choiceA: parsed.choices.A,
        choiceB: parsed.choices.B,
        choiceC: parsed.choices.C,
        choiceD: parsed.choices.D,
        correctAnswer: parsed.correctAnswer,
      },
    });

    return NextResponse.json({ success: true, question: saved });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
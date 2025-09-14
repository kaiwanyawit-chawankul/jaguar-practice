// app/api/create-room/route.ts

import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST() {
  const roomId = nanoid(8); // generate 8 char unique ID
  return NextResponse.json({ roomId });
}

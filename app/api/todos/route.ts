import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching todos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, dueDate } = await request.json();
    if (!title || title.trim() === '') return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    let imageUrl: string | null = null;
    let imageAlt: string | null = null;

    try {
      const pexelsUrl = new URL('https://api.pexels.com/v1/search');
      pexelsUrl.searchParams.append('query', title.slice(0, 60)); // truncate in case todo is long
      pexelsUrl.searchParams.append('orientation', 'square');
      pexelsUrl.searchParams.append('per_page', '1');

      const pexelsResponse = await fetch(pexelsUrl.toString(), {
        headers: {
          Authorization: process.env.PEXEL_API_KEY!,
        },
      });

      if (pexelsResponse.ok) {
        const data = await pexelsResponse.json();
        const photo = data.photos?.[0];
        if (photo) {
          imageUrl = photo.src.original; // largest filesize to showcase loading
          imageAlt = photo.alt;
        }
      } else {
        console.error(`Pexels API error: ${pexelsResponse.status} ${pexelsResponse.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch image from Pexels:', error);
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        imageUrl,
        imageAlt,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating todo' }, { status: 500 });
  }
}
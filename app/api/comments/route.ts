import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad' },
        { status: 401 }
      );
    }

    const { barId, text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Kommentar kan inte vara tom' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        barId,
        text: text.trim(),
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Kunde inte spara kommentar' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barId = searchParams.get('barId');

    if (!barId) {
      return NextResponse.json(
        { error: 'barId krävs' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { barId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta kommentarer' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch {
    // エラーの詳細は記録するが、クライアントには詳細を送らない
    console.error('Failed to fetch products from the database');
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

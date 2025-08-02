import { NextResponse } from 'next/server';

const mockChannels = [
  { id: '1', name: 'general', isPrivate: false, description: 'General discussion channel' },
  { id: '2', name: 'random', isPrivate: false, description: 'Random conversations' },
  { id: '3', name: 'dev-team', isPrivate: true, description: 'Development team discussions' },
  { id: '4', name: 'design', isPrivate: false, description: 'Design discussions and feedback' },
  { id: '5', name: 'marketing', isPrivate: true, description: 'Marketing team coordination' },
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return NextResponse.json({ 
    channels: mockChannels,
    timestamp: new Date().toISOString()
  });
}
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for SSE
export const dynamic = 'force-dynamic'

// Export broadcastEvent function for other modules
export function broadcastEvent(event: any) {
  // In a real implementation, this would broadcast to connected SSE clients
  console.log('Broadcasting event:', event)
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`))
      
      // Send periodic updates
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'heartbeat', 
          timestamp: new Date().toISOString() 
        })}\n\n`))
      }, 30000) // Every 30 seconds
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
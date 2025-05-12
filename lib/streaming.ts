// lib/streaming.ts

import { Readable } from 'stream';

interface StreamingResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

interface CallbackHandlers {
  handleLLMNewToken: (token: string) => Promise<void>;
  handleLLMEnd: () => Promise<void>;
  handleLLMError: (err: Error) => Promise<void>;
}

// Type guard to check if a stream is a Node.js Readable stream
function isNodeReadable(stream: ReadableStream<any> | Readable): stream is Readable {
  return (
    typeof stream === 'object' && 
    stream !== null && 
    'on' in stream && 
    typeof (stream as any).on === 'function'
  );
}

// Helper function to safely convert data to Uint8Array
function toUint8Array(chunk: unknown): Uint8Array {
  if (chunk instanceof Uint8Array) {
    return chunk;
  } else if (Buffer.isBuffer(chunk)) {
    return new Uint8Array(chunk);
  } else if (typeof chunk === 'string') {
    return new TextEncoder().encode(chunk);
  } else if (chunk instanceof ArrayBuffer || ArrayBuffer.isView(chunk)) {
    return new Uint8Array(chunk instanceof ArrayBuffer ? chunk : chunk.buffer);
  } else {
    // Fallback for other types - convert to string first
    return new TextEncoder().encode(String(chunk));
  }
}

/**
 * Custom implementation of StreamingTextResponse to replace the Vercel AI SDK
 * @param {ReadableStream|Readable} stream - The stream to send as response
 * @param {StreamingResponseOptions} options - Response options
 * @returns {Response} - A streaming response
 */
export function CustomStreamingResponse(
  stream: ReadableStream<any> | Readable, 
  options: StreamingResponseOptions = {}
): Response {
  const { status = 200, headers = {} } = options;
  
  // Handle Node.js Readable streams
  if (isNodeReadable(stream)) {
    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(toUint8Array(chunk));
        });
        stream.on('end', () => controller.close());
        stream.on('error', (err: Error) => controller.error(err));
      },
      cancel() {
        if ('destroy' in stream && typeof stream.destroy === 'function') {
          stream.destroy();
        } else if ('close' in stream && typeof stream.close === 'function') {
          stream.close();
        }
      }
    });
    return new Response(readable, {
      status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...headers,
      },
    });
  }
  
  // Handle web ReadableStream
  return new Response(stream, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...headers,
    },
  });
}

/**
 * Custom implementation of LangchainStream to replace the Vercel AI SDK
 * @returns An object with handlers and stream
 */
export function CustomLangchainStream(): { 
  handlers: CallbackHandlers; 
  stream: ReadableStream<Uint8Array>;
} {
  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  const handlers: CallbackHandlers = {
    handleLLMNewToken: async (token: string) => {
      await writer.write(encoder.encode(token));
    },
    handleLLMEnd: async () => {
      await writer.close();
    },
    handleLLMError: async (err: Error) => {
      await writer.abort(err);
    }
  };

  return {
    handlers,
    stream: stream.readable,
  };
}

/**
 * Creates a CallbackManager compatible with LangChain
 * @param handlers The handlers for LLM events
 * @returns A callback manager for LangChain
 */
export function createCallbackManager(handlers: CallbackHandlers): any {
  return {
    handleLLMNewToken: handlers.handleLLMNewToken,
    handleLLMEnd: handlers.handleLLMEnd,
    handleLLMError: handlers.handleLLMError,
  };
}
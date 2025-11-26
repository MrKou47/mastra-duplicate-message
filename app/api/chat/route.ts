import { mastra } from "@/src/mastra";
import { toAISdkStream } from '@mastra/ai-sdk'
import { createUIMessageStreamResponse, createUIMessageStream } from 'ai'

const myAgent = mastra.getAgent("weatherAgent");
export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { messages } = await req.json() as { messages: any[] }

  const stream = await myAgent.stream(messages, {
    memory: {
      thread: "2",
      resource: "1",
    },
  });

  const uiMessageStream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      for await (const part of toAISdkStream(stream, {
        from: 'agent',
      })) {
        writer.write(part);
      }
    },
  });
  const response = createUIMessageStreamResponse({
    stream: uiMessageStream,
  });

  return response;
}

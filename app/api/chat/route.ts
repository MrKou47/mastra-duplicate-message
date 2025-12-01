import { mastra } from "@/src/mastra";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  InferUIMessageChunk,
  UIMessage,
} from "ai";
import { toAISdkFormat, toAISdkStream } from "@mastra/ai-sdk";
import { ReadableStream } from "node:stream/web";

const myAgent = mastra.getAgent("weatherAgent");
export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await myAgent.stream(messages, {
    memory: {
      thread: "2",
      resource: "1",
    },
  });

  let lastMessageId: string | undefined;
  if (
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant"
  ) {
    lastMessageId = messages[messages.length - 1].id;
  }

  const uiMessageStream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      for await (const part of toAISdkStream(stream, {
        from: "agent",
        lastMessageId,
        sendStart: true,
        sendFinish: true,
        sendReasoning: true,
        sendSources: true,
      }) as ReadableStream<InferUIMessageChunk<UIMessage>>) {
        writer.write(part);
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
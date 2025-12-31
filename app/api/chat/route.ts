import { mastra } from "@/src/mastra";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  InferUIMessageChunk,
  UIMessage,
} from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { ReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";

const myAgent = mastra.getAgent("weatherAgent");
export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessage = messages[messages.length - 1];

  const stream = await myAgent.stream(lastMessage, {
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
      for await (const part of toAISdkFormat(stream, {
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
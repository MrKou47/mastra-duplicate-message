"use client";

import { UIMessage, useChat } from "@ai-sdk/react";
import useSWR from "swr";
import { useState, useEffect, ChangeEvent } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then(res => res as UIMessage[]);

export default function Chat() {
  const { data: initialMessages = [] } = useSWR<UIMessage[]>(
    "/api/initial-chat",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initialMessages,
  });

  // Update messages when initialMessages loads
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  const [input, setInput] = useState("");

  console.log('messsages', messages)

  function onChange(e) {
    setInput(e.target.value)
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div
          key={m.id}
          className="whitespace-pre-wrap"
          style={{ marginTop: "1em" }}
        >
          <h3
            style={{
              fontWeight: "bold",
              color: m.role === "user" ? "green" : "yellow",
            }}
          >
            {m.role === "user" ? "User: " : "AI: "}
          </h3>
          {m.parts.map((p, i) => {
            if (p.type === "text") {
              return <span key={i}>{p.text}</span>;
            }
            if(p.type === 'reasoning') {
              return <span key={i} style={{ color: 'gray' }}>Reasoning: {p.text}</span>;
            }
            return null;
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Ask about the weather..."
          onChange={onChange}
          disabled={status !== "ready"}
        />
      </form>
    </div>
  );
}

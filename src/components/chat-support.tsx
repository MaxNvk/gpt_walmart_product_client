"use client";

import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/chat/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "./code-display-block";
import { useRequests } from "@/hooks/useRequests";
import { toast } from "sonner";

interface IMessage {
  role: "user" | "agent";
  content: string;
  timestampCreated: number;
}

export default function ChatSupport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const requests = useRequests();

  const addMessage = useCallback((content: string, isUser: boolean) => {
    const message: IMessage = {
      role: isUser ? "user" : "agent",
      content,
      timestampCreated: +new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, message]);

    return message;
  }, []);

  const getInitialMessage = async () => {
    try {
      const response = await requests.get("/agent/get-initial-message");
      console.log(response.data);

      addMessage(response.data.message, false);

      setIsLoading(false);
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to fetch initial message", error);
      toast.error("Failed to fetch the initial message.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInitialMessage();
  }, []);

  const handleSubmit = async (message: IMessage) => {
    try {
      const { data } = await requests.post("/product/process", {
        data: [...messages, message]
          .map((item) => `${item.role}(${item.timestampCreated}): ${item.content}`)
          .join(";"),
      });

      addMessage(
        `Product info: ${data.product_info}\n\nValidation result: ${data.validation_result}\n\nSetup result: ${data.setup_result}`,
        false
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsGenerating(true);
    setIsLoading(true);

    const message = addMessage(inputValue, true);
    setInputValue("");

    await handleSubmit(message);

  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (isGenerating || isLoading) return;

      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <ExpandableChat size="md" position="bottom-center">
      <ExpandableChatHeader className="bg-muted/60 flex-col text-center justify-center">
        <h1 className="text-xl font-semibold">Chat with our AI ✨</h1>
        <p>Ask any question for our AI to answer</p>
        <div className="flex gap-2 items-center pt-2"></div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList
          className="bg-muted/25 w-[900px] min-h-96 max-h-[50vh]"
          ref={messagesRef}
        >
          {/* Messages */}
          {messages &&
            messages.map((message, index) => (
              <ChatBubble
                key={index}
                variant={message.role === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src={message.role === "user" ? "" : ""}
                  fallback={message.role === "user" ? "👨🏽" : "🤖"}
                />
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  {message.content.split("```").map((part, index) => {
                    if (index % 2 === 0) {
                      return (
                        <Markdown key={index} remarkPlugins={[remarkGfm]}>
                          {part}
                        </Markdown>
                      );
                    } else {
                      return (
                        <pre className="pt-2" key={index}>
                          <CodeDisplayBlock code={part} lang="" />
                        </pre>
                      );
                    }
                  })}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>
      <ExpandableChatFooter className="bg-muted/25">
        <form ref={formRef} className="flex relative gap-2" onSubmit={onSubmit}>
          <ChatInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-h-12 bg-background shadow-none"
          />
          <Button
            className="absolute top-1/2 right-2 transform -translate-y-1/2"
            type="submit"
            size="icon"
            disabled={isLoading}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}

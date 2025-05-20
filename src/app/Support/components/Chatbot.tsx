// components/user-support/Chatbot.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import { ScrollArea } from "@/app/Superadmin/dashboard/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

interface ChatbotProps {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

const Chatbot = ({ isChatOpen, setIsChatOpen }: ChatbotProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "Hi! I'm here to assist with SalonSphere. What can I help you with today?",
      isBot: true,
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      fetchSuggestedQuestions();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    if (suggestionsRef.current && suggestedQuestions.length > 0) {
      suggestionsRef.current.scrollTop = 0;
    }
  }, [chatMessages, suggestedQuestions]);

  const fetchSuggestedQuestions = async () => {
    try {
      const response = await fetch("/api/user/support/suggestions");
      const data = await response.json();
      setSuggestedQuestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: userMessage,
      isBot: false,
    };

    setChatMessages([...chatMessages, newMessage]);
    setUserMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const botResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: data.response,
        isBot: true,
      };

      setChatMessages((prev) => [...prev, botResponse]);
      fetchSuggestedQuestions();
    } catch (error) {
      console.error("Error getting bot response:", error);
      const errorResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: "Sorry, something went wrong. Please try again.",
        isBot: true,
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    setUserMessage(question);
    await handleSendMessage();
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-[1.5rem] right-[1rem] w-full max-w-[90vw] sm:max-w-[340px] md:max-w-[380px] z-50 min-w-[250px]"
        >
          <div className="bg-gradient-to-br from-[#B4004E] to-[#6B1A4B] rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Chat with SalonBot</h3>
                  <p className="text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    We reply immediately
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="h-[40vh] sm:h-[250px] md:h-[300px] p-3 bg-white/5 max-h-[400px]">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-3 flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.isBot ? "bg-white text-gray-900" : "bg-[#D5AA68] text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/20 rounded-lg p-2 text-white text-sm">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Typing...
                    </motion.div>
                  </div>
                </div>
              )}
            </ScrollArea>
            <div className="p-3 bg-white/10">
              <div className="flex items-center space-x-2">
                <Input
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Enter your message..."
                  className="flex-1 rounded-full bg-white/20 text-white placeholder-white/60 border-none focus:ring-2 focus:ring-[#D5AA68]"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="rounded-full bg-[#D5AA68] text-white hover:bg-[#B98A4A]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              {suggestedQuestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-white/70 mb-2">Suggested questions:</p>
                  <ScrollArea className="h-[30vh] sm:h-[180px] md:h-[200px] pr-2 max-h-[250px]">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 mb-2 rounded-lg"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;
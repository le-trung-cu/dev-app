import { useEffect, useState } from "react";

interface UseChatScrollProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  count: number;
}

export const useChatScroll = ({
  chatRef,
  bottomRef,
  count,
}: UseChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [haveNewMessages, setHaveNewMessages] = useState(false);

  useEffect(() => {
    const topDiv = chatRef.current;
    const bottomDiv = bottomRef.current;
    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }
      if (!topDiv) {
        return false;
      }

      const distinaceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

      console.log({
        distinaceFromBottom,
        scrollHeight: topDiv.scrollHeight,
        scrollTop: topDiv.scrollTop,
        clientHeight: topDiv.clientHeight,
      });
      return distinaceFromBottom <= 100;
    };

    if (shouldAutoScroll()) {
      setHaveNewMessages(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else {
      setHaveNewMessages(true);
    }
  }, [chatRef, bottomRef, count]);

  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHaveNewMessages(false);
        console.log("setHaveNewMessages", false);

        }
        console.log("observer", entry);
      }
      // { threshold:  }
    );

    observer.observe(bottomRef.current);

    return () => {
      observer.disconnect();
      console.log("observer.disconnect");
    };
  }, [bottomRef]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return { haveNewMessages, scrollToBottom };
};

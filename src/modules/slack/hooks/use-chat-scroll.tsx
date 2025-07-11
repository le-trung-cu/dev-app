import { useCallback, useEffect, useRef, useState } from "react";

interface UseChatScrollProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  count: number;
  shouldLoadMore?: boolean;
  isFetching?: boolean;
  loadMore?: () => void;
}

export const useChatScroll = ({
  chatRef,
  bottomRef,
  count,
  shouldLoadMore = false,
  isFetching,
  loadMore,
}: UseChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [haveNewMessages, setHaveNewMessages] = useState(false);
  const shouldLoadMoreRef = useRef(shouldLoadMore);
  const loadMoreRef = useRef(loadMore);

  shouldLoadMoreRef.current = shouldLoadMore;
  loadMoreRef.current = loadMore;

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
      // console.log({
      //   distinaceFromBottom,
      //   scrollHeight: topDiv.scrollHeight,
      //   scrollTop: topDiv.scrollTop,
      //   clientHeight: topDiv.clientHeight,
      // });
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
    if (!chatRef.current) return;
    const scroll = chatRef.current.scrollHeight;
    if (isFetching) {
      return () => {
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight - scroll);
      };
    }
  }, [isFetching, chatRef]);

  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHaveNewMessages(false);
      }
    });

    observer.observe(bottomRef.current);

    return () => {
      observer.disconnect();
    };
  }, [bottomRef]);

  const onLoadMore = useCallback((el: HTMLDivElement) => {
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        shouldLoadMore = shouldLoadMoreRef.current;
        loadMore = loadMoreRef.current;
        if (entry.isIntersecting && shouldLoadMore && loadMore) {
          console.log("isIntersecting");
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(el);
    // loadMore?.();

    return () => observer.disconnect();
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return { haveNewMessages, scrollToBottom, loadMoreRef: onLoadMore };
};

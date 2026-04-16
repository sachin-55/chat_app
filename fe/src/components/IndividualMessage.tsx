import dayjs from "dayjs";
import React, { useEffect } from "react";
import type { Message } from "../types";
import { DateSeparator, MessageBubble, MessageTime } from "./ChatWindow.styles";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

interface IndividualMessageProps {
  message: Message;
  isOwn: boolean;
  isNewDay: boolean;
  markAsRead: VoidFunction;
}

const IndividualMessage: React.FC<IndividualMessageProps> = ({
  message,
  isOwn,
  isNewDay,
  markAsRead,
}) => {
  const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    {
      enabled: !isOwn && !message?.readAt,
      options: { threshold: 0.5 },
    },
  );

  useEffect(() => {
    if (isIntersecting && document.visibilityState === "visible") {
      markAsRead();
    }
  }, [isIntersecting, markAsRead]);
  const currentDate = dayjs(message.sentAt);

  const formatSeparatorDate = (date: dayjs.Dayjs) => {
    if (date.isSame(dayjs(), "day")) return "Today";
    if (date.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMMM D, YYYY");
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case "SENT":
        return "✓";
      case "DELIVERED":
        return "✓✓";
      case "READ":
        return "✓✓✓";
      default:
        return "✓";
    }
  };

  return (
    <>
      <MessageBubble $isOwn={isOwn} ref={targetRef}>
        {message.text}
        <MessageTime $isOwn={isOwn}>
          {isOwn && (
            <span style={{ marginRight: "4px" }}>{getStatusIcon()}</span>
          )}
          {currentDate.format("HH:mm")}
        </MessageTime>
      </MessageBubble>
      {isNewDay && (
        <DateSeparator>
          <span>{formatSeparatorDate(currentDate)}</span>
        </DateSeparator>
      )}
    </>
  );
};

export default IndividualMessage;

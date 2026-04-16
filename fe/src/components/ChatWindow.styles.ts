import styled from "styled-components";

export const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  height: calc(100vh - 80px);
`;

export const ChatHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
`;

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
`;

export const MessageBubble = styled.div<{ $isOwn: boolean }>`
  max-width: 60%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.95rem;
  align-self: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  background: ${({ $isOwn }) =>
    $isOwn
      ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
      : "var(--bg-secondary)"};
  color: ${({ $isOwn }) => ($isOwn ? "white" : "var(--text-primary)")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease-out;
  border-bottom-right-radius: ${({ $isOwn }) => ($isOwn ? "4px" : "16px")};
  border-bottom-left-radius: ${({ $isOwn }) => ($isOwn ? "16px" : "4px")};
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const MessageTime = styled.span<{ $isOwn: boolean }>`
  font-size: 0.7rem;
  margin-top: 0.25rem;
  align-self: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  opacity: 0.7;
`;

export const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
    z-index: 1;
  }

  span {
    background: var(--bg-primary);
    padding: 0 1rem;
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 500;
    position: relative;
    z-index: 2;
  }
`;

export const InputArea = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border);
`;

export const StyledForm = styled.form`
  display: flex;
  gap: 0.75rem;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
`;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useChatStore } from "../store/useChatStore";
import { Avatar, Flex, Input } from "./Common";
import { useAuthStore } from "../store/useAuthStore";

const SidebarContainer = styled.div`
  width: 350px;
  height: 100vh;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
`;

const SearchWrapper = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
`;

const ListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

const ItemCard = styled.div<{ $active?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ $active }) =>
    $active ? "rgba(56, 189, 248, 0.1)" : "transparent"};
  border: 1px solid
    ${({ $active }) => ($active ? "var(--accent-primary)" : "transparent")};

  &:hover {
    background-color: var(--bg-secondary);
  }
`;

const UserName = styled.p`
  font-weight: 600;
  font-size: 0.95rem;
`;

const LastMsg = styled.p`
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Status = styled.div<{ $online?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $online }) =>
    $online ? "var(--success)" : "var(--text-muted)"};
  border: 2px solid var(--bg-primary);
  position: absolute;
  bottom: 0;
  right: 0;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Sidebar: React.FC = () => {
  const [search, setSearch] = useState("");
  const { conversations, activeConversation, fetchConversations, isLoading } =
    useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const abortController = new AbortController();
    fetchConversations({ limit: 20, page: 1 }, abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
  };

  return (
    <SidebarContainer>
      <SearchWrapper>
        <Input
          placeholder="Search users..."
          value={search}
          onChange={handleSearch}
        />
      </SearchWrapper>

      <ListWrapper>
        {isLoading && (
          <p style={{ textAlign: "center", padding: "1rem" }}>Loading...</p>
        )}

        {conversations.map((conversation) => {
          const receiverUser = conversation?.participants?.find(
            (p) => p._id !== user?._id,
          );
          return (
            <ItemCard
              key={conversation._id}
              onClick={() => {
                // Create or set conversation logic here
                // For simplicity, find if a conversation already exists
                alert("CLICKED ON CONVERSATION");
              }}
              $active={activeConversation?.participants.some(
                (p) => p._id === conversation._id,
              )}
            >
              <Flex $gap="0.75rem" $align="center">
                <AvatarWrapper>
                  <Avatar $size="45px">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </Avatar>
                  <Status $online />
                </AvatarWrapper>
                <div style={{ flex: 1 }}>
                  <UserName>{receiverUser.name}</UserName>
                  <UserName>{receiverUser.email}</UserName>
                  <LastMsg>{conversation.lastMessage?.text}</LastMsg>
                </div>
              </Flex>
            </ItemCard>
          );
        })}
      </ListWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;

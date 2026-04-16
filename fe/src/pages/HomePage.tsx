import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Avatar, Button, Card, Input } from "../components/Common";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import type { User } from "../types";

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const UserCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem;
  width: 100%;
  padding: 0 2rem;
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { users, fetchUsers, isLoading } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers({ limit: 20, page: 1 }, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleStartConversation = (user: User) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/", userId: user._id } });
      return;
    }

    navigate(`/conversation?uid=${user._id}`);
  };

  const displayUsers = users;

  return (
    <PageContainer>
      <Navbar />
      <HeaderSection>
        <Title>Connect with Anyone</Title>
        <Subtitle>
          Premium real-time chat experience with users around the world.
        </Subtitle>
      </HeaderSection>

      <SearchContainer>
        <Input
          placeholder="Search for users by name or username..."
          value={query}
          onChange={handleSearch}
        />
      </SearchContainer>

      <UserGrid>
        {isLoading && (
          <p style={{ gridColumn: "1/-1", textAlign: "center" }}>Loading...</p>
        )}
        {!isLoading &&
          displayUsers.map((user) => (
            <UserCard key={user._id}>
              <Avatar $size="80px">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  user.name[0].toUpperCase()
                )}
              </Avatar>
              <div>
                <h3>{user.name}</h3>
                <p style={{ color: "var(--text-muted)" }}>{user.email}</p>
              </div>
              <Button onClick={() => handleStartConversation(user)}>
                Start Conversation
              </Button>
            </UserCard>
          ))}
      </UserGrid>
    </PageContainer>
  );
};

export default HomePage;

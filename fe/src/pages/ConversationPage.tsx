import React from "react";
import styled from "styled-components";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Navbar from "../components/Navbar";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ConversationPage: React.FC = () => {
  return (
    <PageContainer>
      <Navbar />
      <Content>
        <Sidebar />
        <ChatWindow />
      </Content>
    </PageContainer>
  );
};

export default ConversationPage;

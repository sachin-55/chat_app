import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ChatWindow from "../components/ChatWindow";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

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
  const {
    setActiveConversationId,
    activeConversationId,
    fetchConversationDetails,
  } = useChatStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get("cid");

  useEffect(() => {
    if (!conversationId && activeConversationId) {
      searchParams.set("cid", activeConversationId);
      setSearchParams(searchParams);
    }
  }, [
    conversationId,
    activeConversationId,
    setActiveConversationId,
    setSearchParams,
    searchParams,
  ]);

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails(conversationId);
    }
  }, [conversationId, fetchConversationDetails]);

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

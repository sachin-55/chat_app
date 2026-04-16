import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "../store/useAuthStore";
import { Flex, Button } from "./Common";

const NavContainer = styled.nav`
  padding: 1rem 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
`;

const NavLinks = styled(Flex)`
  gap: 1.5rem;
  align-items: center;
`;

const StyledLink = styled(Link)`
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
  text-decoration: none;

  &:hover {
    color: var(--accent-primary);
  }
`;

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <NavContainer>
      <Logo to="/">ChatApp</Logo>

      <NavLinks>
        {isAuthenticated ? (
          <>
            {location.pathname !== "/conversation" && (
              <StyledLink to="/conversation">Go to Conversation</StyledLink>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Hello, {user?.name}
            </span>
            <Button $variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <StyledLink to="/login">Login</StyledLink>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </>
        )}
      </NavLinks>
    </NavContainer>
  );
};

export default Navbar;

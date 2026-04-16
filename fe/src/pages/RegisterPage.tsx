import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Card, Input } from "../components/Common";
import { useAuthStore } from "../store/useAuthStore";

const AuthContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at top right,
    var(--bg-secondary),
    var(--bg-primary)
  );
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  animation: fadeIn 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const ErrorMsg = styled.p`
  color: var(--error);
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const RedirectLink = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  a {
    color: var(--accent-primary);
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { register, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);

      const from = location.state?.from || "/conversation";
      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
      // Error handled by store
    }
  };

  return (
    <AuthContainer>
      <StyledCard>
        <Title>Create Account</Title>
        <Subtitle>Join our premium chat experience</Subtitle>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Form onSubmit={handleSubmit}>
          <div>
            <Label>Full Name</Label>
            <Input
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </Form>

        <RedirectLink>
          Already have an account?{" "}
          <Link to="/login" onClick={() => setError(null)}>
            Login
          </Link>
        </RedirectLink>
      </StyledCard>
    </AuthContainer>
  );
};

export default RegisterPage;

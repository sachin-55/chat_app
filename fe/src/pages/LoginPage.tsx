import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useFormik } from "formik";
import { Button, Card, Input, ErrorText, FormGroup } from "../components/Common";
import { useAuthStore } from "../store/useAuthStore";
import { loginSchema } from "../utils/validationSchemas";

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
  max-width: 400px;
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
  margin-bottom: 0.1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const GlobalErrorMsg = styled.p`
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

const LoginPage: React.FC = () => {
  const { login, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        await login(values);
        const from = location.state?.from || "/conversations";
        navigate(from, { replace: true });
      } catch (err) {
        console.error("LOGIN ->", err);
      }
    },
  });

  return (
    <AuthContainer>
      <StyledCard>
        <Title>Welcome Back</Title>
        <Subtitle>Enter your credentials to continue</Subtitle>

        {error && <GlobalErrorMsg>{error}</GlobalErrorMsg>}

        <Form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <ErrorText>{formik.errors.email}</ErrorText>
            ) : null}
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <ErrorText>{formik.errors.password}</ErrorText>
            ) : null}
          </FormGroup>

          <Button type="submit" disabled={isLoading || !formik.isValid}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </Form>

        <RedirectLink>
          Don't have an account?{" "}
          <Link to="/register" onClick={() => setError(null)}>
            Register
          </Link>
        </RedirectLink>
      </StyledCard>
    </AuthContainer>
  );
};

export default LoginPage;

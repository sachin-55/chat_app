import styled from 'styled-components';

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  ${({ $variant }) => {
    switch ($variant) {
      case 'secondary':
        return `
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          &:hover { background-color: var(--text-muted); }
        `;
      case 'outline':
        return `
          border: 1px solid var(--border);
          color: var(--text-primary);
          &:hover { background-color: var(--border); }
        `;
      case 'danger':
        return `
          background-color: var(--error);
          color: white;
          &:hover { filter: brightness(1.1); }
        `;
      default:
        return `
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3); }
          &:active { transform: translateY(0); }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1);
  }
`;

export const Card = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

export const GlassContainer = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
`;

export const Avatar = styled.div<{ $size?: string }>`
  width: ${({ $size }) => $size || '40px'};
  height: ${({ $size }) => $size || '40px'};
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Flex = styled.div<{ $direction?: string; $justify?: string; $align?: string; $gap?: string }>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction || 'row'};
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  align-items: ${({ $align }) => $align || 'stretch'};
  gap: ${({ $gap }) => $gap || "0"};
`;

export const ErrorText = styled.span`
  color: var(--error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
  animation: fadeIn 0.2s ease;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
`;

import { type ButtonProps } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button } from './chakra/button';

interface LinkButtonProps extends ButtonProps {
  to: string;
  children: ReactNode;
}

export const LinkButton = ({
  to,
  children,
  ...buttonProps
}: LinkButtonProps) => {
  return (
    <Button
      asChild
      {...buttonProps}
    >
      <Link to={to}>
        {children}
      </Link>
    </Button>
  );
};

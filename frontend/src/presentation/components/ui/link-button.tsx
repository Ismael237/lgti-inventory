import { type ButtonProps } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button } from './chakra/button';
import { useTranslation } from 'react-i18next';

interface LinkButtonProps extends ButtonProps {
  to: string;
  children: ReactNode;
}

export const LinkButton = ({
  to,
  children,
  ...buttonProps
}: LinkButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      asChild={!buttonProps.loading}
      loadingText={t('common.loading')}
      {...buttonProps}
    >
      {!buttonProps.loading && <Link to={to}>{children}</Link>}
    </Button>
  );
};

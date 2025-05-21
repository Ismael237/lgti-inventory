import { LuDownload } from 'react-icons/lu';
import { LinkButton } from './link-button';
import { type ButtonProps } from '@chakra-ui/react';
import { Tooltip } from './chakra/tooltip';
import { useTranslation } from 'react-i18next';

interface ExportButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  baseUrl: string;
  onClick?: () => void;
}

export const ExportButton = ({
  baseUrl,
  onClick,
  ...buttonProps
}: ExportButtonProps) => {
  const { t } = useTranslation();
  const exportUrl = `${baseUrl}/export`;

  return (
    <Tooltip content={t('actions.export_tooltip')}>
      <LinkButton
        to={exportUrl}
        colorPalette="gray"
        variant="outline"
        onClick={onClick}
        {...buttonProps}
      >
        <LuDownload />
        {t('actions.export')}
      </LinkButton>
    </Tooltip>
  );
};

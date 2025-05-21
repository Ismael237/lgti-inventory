import { type ButtonProps } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@ui/chakra/button';
import { LuChevronLeft } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './chakra/tooltip';

interface BackButtonProps extends ButtonProps {
    label?: string;
}

export const BackButton = ({ label, ...props }: BackButtonProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const defaultLabel = label || t('common.back');

    return (
        <Tooltip content={t('tooltip.back_to_previous')}>
            <Button
                size="sm"
                variant="outline"
                colorPalette="gray"
                onClick={() => navigate(-1)}
                {...props}
            >
                <LuChevronLeft />{defaultLabel}
            </Button>
        </Tooltip>
    );
};
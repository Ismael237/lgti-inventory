import {
    Button,
    Dialog,
    Portal,
    CloseButton
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColorPalette?: string;
    isLoading?: boolean;
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    confirmColorPalette = 'red',
    isLoading = false
}: ConfirmationDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={onClose}
            lazyMount
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            {title}
                        </Dialog.Header>

                        <Dialog.Body>
                            {message}
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">{cancelLabel || t('actions.cancel')}</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette={confirmColorPalette}
                                onClick={onConfirm}
                                loading={isLoading}
                            >
                                {confirmLabel || t('actions.confirm')}
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
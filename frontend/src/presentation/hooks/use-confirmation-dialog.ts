import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";

export const useConfirmationDialog = <T extends number | string>() => {
    const { open, onOpen, onClose } = useDisclosure();
    const [entityId, setEntityId] = useState<T | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const openDialog = (id: T) => {
        setEntityId(id);
        onOpen();
    };

    const handleConfirmation = async (actionFn: (id: T) => Promise<void>) => {
        if (entityId !== null) {
            setIsProcessing(true);
            try {
                await actionFn(entityId);
                onClose();
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return {
        isOpen: open,
        onOpen,
        onClose,
        openDialog,
        handleConfirmation,
        entityId,
        isProcessing
    };
};
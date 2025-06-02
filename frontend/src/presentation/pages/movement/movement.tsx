import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MovementViewType as ViewType } from '@entities';

import MovementList from './movement-list';
import MovementDetails from './movement-details';
import { MovementExport } from './movement-export';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
  DialogFooter} from '@ui/chakra/dialog';
import { useDisclosure } from '@chakra-ui/react';
import { MovementFormCreate } from './movement-form-create';
import { MovementDeleteContent, MovementDeleteFooter } from './movement-delete';
import { MovementFormUpdate } from './movement-form-update';



interface MovementComponentProps {
  viewType?: ViewType;
  baseUrl?: string;
}

const Movement: React.FC<MovementComponentProps> = ({
  viewType = ViewType.LIST,
  baseUrl = '/movements',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const movementId = params.id;

  const {
    open: isDialogOpen,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();

  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogFooter, setDialogFooter] = useState<ReactNode | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasInitializedRef = useRef(false);

  const configureDialog = useCallback(() => {
    switch (viewType) {
      case ViewType.NEW:
        setDialogTitle(t('movements.dialog.add_title'));
        setDialogContent(<MovementFormCreate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        break;

      case ViewType.EDIT:
        if (!movementId) return navigate(baseUrl);
        setDialogTitle(t('movements.dialog.edit_title'));
        setDialogContent(<MovementFormUpdate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        break;

      case ViewType.DELETE:
        if (!movementId) return navigate(baseUrl);
        setDialogTitle(t('movements.dialog.delete_title'));
        setDialogContent(<MovementDeleteContent />);
        setDialogFooter(<MovementDeleteFooter />);
        break;

      case ViewType.DETAILS:
        if (!movementId) return navigate(baseUrl);
        setDialogTitle(t('movements.dialog.details_title'));
        setDialogContent(<MovementDetails />);
        setDialogFooter(null);
        break;

      case ViewType.EXPORT:
        setDialogTitle(t('movements.dialog.export_title'));
        setDialogContent(<MovementExport />);
        setDialogFooter(null);
        break;

      default:
        break;
    }

  }, [movementId, viewType]);

  useEffect(() => {
    if (viewType === ViewType.LIST) {
      onCloseDialog();
      hasInitializedRef.current = false;
    } else if (!hasInitializedRef.current) {
      configureDialog();
      onOpenDialog();
      hasInitializedRef.current = true;
    }
  }, [viewType, onOpenDialog, onCloseDialog, configureDialog]);

  useEffect(() => {
    if (viewType !== ViewType.LIST && movementId) {
      configureDialog();
    }
  }, [movementId, configureDialog, viewType]);


  const handleCloseDialog = (): void => {
    onCloseDialog();
    navigate(baseUrl);
  };

  return (
    <>
      <MovementList viewType={viewType} />

      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(e) => {
          if (!e.open) handleCloseDialog();
        }}
        size="sm"
        scrollBehavior="inside"
      >
        <DialogContent ref={contentRef}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            {dialogContent}
          </DialogBody>
          {dialogFooter && <DialogFooter>{dialogFooter}</DialogFooter>}
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default Movement;

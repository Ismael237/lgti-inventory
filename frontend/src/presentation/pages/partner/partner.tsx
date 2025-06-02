import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PartnerList from './partner-list';
import PartnerDetails from './partner-details';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
  DialogFooter} from '@ui/chakra/dialog';
import { useDisclosure, type DialogRootProps } from '@chakra-ui/react';
import { PartnerFormCreate } from './partner-form-create';
import { PartnerDeleteContent, PartnerDeleteFooter } from './partner-delete';
import { PartnerFormUpdate } from './partner-form-update';
import { PartnerViewType as ViewType } from '@entities';
import { PartnerExport } from './partner-export';

interface PartnerComponentProps {
  viewType?: ViewType;
  baseUrl?: string;
}

const Partner: React.FC<PartnerComponentProps> = ({
  viewType = ViewType.LIST,
  baseUrl = '/partners',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const partnerId = params.id;

  const {
    open: isDialogOpen,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();

  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogFooter, setDialogFooter] = useState<ReactNode | null>(null);
  const [dialogProps, setDialogProps] = useState<Omit<DialogRootProps, 'children'>>({ size: "sm" });
  const contentRef = useRef<HTMLDivElement>(null);

  const configureDialog = useCallback(() => {
    switch (viewType) {
      case ViewType.NEW:
        setDialogTitle(t('partners.dialog.add_title'));
        setDialogContent(<PartnerFormCreate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.EDIT:
        if (!partnerId) return navigate(baseUrl);
        setDialogTitle(t('partners.dialog.edit_title'));
        setDialogContent(<PartnerFormUpdate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.DELETE:
        if (!partnerId) return navigate(baseUrl);
        setDialogTitle(t('partners.dialog.delete_title'));
        setDialogContent(<PartnerDeleteContent />);
        setDialogFooter(<PartnerDeleteFooter />);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.DETAILS:
        if (!partnerId) return navigate(baseUrl);
        setDialogTitle(t('partners.dialog.details_title'));
        setDialogContent(<PartnerDetails />);
        setDialogFooter(null);
        setDialogProps({
          size: "lg"
        })
        break;
        
      case ViewType.EXPORT:
        return <PartnerExport />;

      default:
        break;
    }

  }, [partnerId, viewType]);

  useEffect(() => {
    if (viewType !== ViewType.LIST) {
      configureDialog();
      onOpenDialog();
    } else {
      onCloseDialog();
    }
  }, [viewType, onOpenDialog, onCloseDialog, configureDialog]);

  useEffect(() => {
    if (viewType !== ViewType.LIST && partnerId) {
      configureDialog();
    }
  }, [partnerId, configureDialog, viewType]);


  const handleCloseDialog = (): void => {
    onCloseDialog();
    navigate(baseUrl);
  };

  // If it's the export view, render the export component directly
  if (viewType === ViewType.EXPORT) {
    return <PartnerExport />;
  }

  return (
    <>
      <PartnerList viewType={viewType} />

      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(e) => {
          if (!e.open) handleCloseDialog();
        }}
        scrollBehavior="inside"
        {...dialogProps}
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

export default Partner;

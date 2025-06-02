import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PriceSimulationList from './price-simulation-list';
import PriceSimulationDetails from './price-simulation-details';
import { PriceSimulationExport } from './price-simulation-export';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
  DialogFooter} from '@ui/chakra/dialog';
import { useDisclosure } from '@chakra-ui/react';
import { PriceSimulationFormCreate } from './price-simulation-form-create';
import { PriceSimulationDeleteContent, PriceSimulationDeleteFooter } from './price-simulation-delete';
import { PriceSimulationFormUpdate } from './price-simulation-form-update';
import { PriceSimulationViewType } from '@entities/price-simulation.types';

interface PriceSimulationComponentProps {
  viewType?: PriceSimulationViewType;
  baseUrl?: string;
}

const PriceSimulation: React.FC<PriceSimulationComponentProps> = ({
  viewType = PriceSimulationViewType.LIST,
  baseUrl = '/price-simulations',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const simulationId = params.id;

  const {
    open: isDialogOpen,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();

  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogFooter, setDialogFooter] = useState<ReactNode | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const configureDialog = useCallback(() => {
    switch (viewType) {
      case PriceSimulationViewType.NEW:
        setDialogTitle(t('price_simulations.dialog.create_title'));
        setDialogContent(<PriceSimulationFormCreate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        break;

      case PriceSimulationViewType.EDIT:
        if (!simulationId) return navigate(baseUrl);
        setDialogTitle(t('price_simulations.dialog.edit_title'));
        setDialogContent(<PriceSimulationFormUpdate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        break;

      case PriceSimulationViewType.DELETE:
        if (!simulationId) return navigate(baseUrl);
        setDialogTitle(t('price_simulations.dialog.delete_title'));
        setDialogContent(<PriceSimulationDeleteContent />);
        setDialogFooter(<PriceSimulationDeleteFooter />);
        break;

      case PriceSimulationViewType.DETAILS:
        if (!simulationId) return navigate(baseUrl);
        setDialogTitle(t('price_simulations.dialog.details_title'));
        setDialogContent(<PriceSimulationDetails />);
        setDialogFooter(null);
        break;
        
      case PriceSimulationViewType.EXPORT:
        setDialogTitle(t('price_simulations.dialog.export_title'));
        setDialogContent(<PriceSimulationExport />);
        setDialogFooter(null);
        break;

      default:
        break;
    }

  }, [simulationId, viewType]);

  useEffect(() => {
    if (viewType !== PriceSimulationViewType.LIST) {
      configureDialog();
      onOpenDialog();
    } else {
      onCloseDialog();
    }
  }, [viewType, onOpenDialog, onCloseDialog, configureDialog]);

  useEffect(() => {
    if (viewType !== PriceSimulationViewType.LIST && simulationId) {
      configureDialog();
    }
  }, [simulationId, configureDialog, viewType]);


  const handleCloseDialog = (): void => {
    onCloseDialog();
    navigate(baseUrl);
  };

  return (
    <>
      <PriceSimulationList viewType={viewType} />

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

export default PriceSimulation;

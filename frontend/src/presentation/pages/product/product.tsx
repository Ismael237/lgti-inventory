import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ProductList from './product-list';
import ProductDetails from './product-details';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
  DialogFooter} from '@ui/chakra/dialog';
import { useDisclosure, type DialogRootProps } from '@chakra-ui/react';
import { ProductFormCreate } from './product-form-create';
import { ProductDeleteContent, ProductDeleteFooter } from './product-delete';
import { ProductFormUpdate } from './product-form-update';
import { ProductSnapshotList } from './product-snapshot-list';
import { ProductSnapshotDetails } from './product-snapshot-details';
import { ProductSnapshotCreate } from './product-snapshot-create';
import { ProductSnapshotExport } from './product-snapshot-export';
import { ProductExport } from './product-export';
import { ProductViewType as ViewType } from '@entities';

interface ProductComponentProps {
  viewType?: ViewType;
  baseUrl?: string;
}

const Product: React.FC<ProductComponentProps> = ({
  viewType = ViewType.LIST,
  baseUrl = '/products',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string; snapshotId?: string }>();
  const productId = params.id;
  const snapshotId = params.snapshotId;

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
        setDialogTitle(t('products.dialog.add_title'));
        setDialogContent(<ProductFormCreate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.EDIT:
        if (!productId) return navigate(baseUrl);
        setDialogTitle(t('products.dialog.edit_title'));
        setDialogContent(<ProductFormUpdate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.DELETE:
        if (!productId) return navigate(baseUrl);
        setDialogTitle(t('products.dialog.delete_title'));
        setDialogContent(<ProductDeleteContent />);
        setDialogFooter(<ProductDeleteFooter />);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.DETAILS:
        if (!productId) return navigate(baseUrl);
        setDialogTitle(t('products.dialog.details_title'));
        setDialogContent(<ProductDetails />);
        setDialogFooter(null);
        setDialogProps({
          size: "lg"
        })
        break;
      case ViewType.EXPORT:
        setDialogTitle(t('products.dialog.export_title'));
        setDialogContent(<ProductExport />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.SNAPSHOTS:
        setDialogTitle(t('products.snapshots.dialog.title'));
        setDialogContent(<ProductSnapshotList />);
        setDialogFooter(null);
        setDialogProps({
          size: "lg"
        })
        break;

      case ViewType.SNAPSHOT_DETAILS:
        if (!snapshotId) return navigate(`${baseUrl}/snapshots`);
        setDialogTitle(t('products.snapshots.dialog.details_title'));
        setDialogContent(<ProductSnapshotDetails />);
        setDialogFooter(null);
        setDialogProps({
          size: "cover"
        })
        break;

      case ViewType.SNAPSHOT_CREATE:
        setDialogTitle(t('products.snapshots.dialog.create_title'));
        setDialogContent(<ProductSnapshotCreate />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      case ViewType.SNAPSHOT_EXPORT:
        if (!snapshotId) return navigate(`${baseUrl}/snapshots`);
        setDialogTitle(t('products.snapshots.dialog.export_title'));
        setDialogContent(<ProductSnapshotExport />);
        setDialogFooter(null);
        setDialogProps({
          size: "sm"
        })
        break;

      default:
        break;
    }

  }, [productId, snapshotId, viewType]);

  useEffect(() => {
    if (viewType !== ViewType.LIST) {
      configureDialog();
      onOpenDialog();
    } else {
      onCloseDialog();
    }
  }, [viewType, onOpenDialog, onCloseDialog, configureDialog]);

  useEffect(() => {
    if (viewType !== ViewType.LIST && (productId || snapshotId)) {
      configureDialog();
    }
  }, [productId, snapshotId, configureDialog, viewType]);


  const handleCloseDialog = (): void => {
    onCloseDialog();
    navigate(baseUrl);
  };

  return (
    <>
      <ProductList viewType={viewType} />

      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(e) => {
          if (!e.open) handleCloseDialog();
        }}
        scrollBehavior="inside"
        {...dialogProps}
      >
        <DialogContent h="100%" maxH={ dialogProps.size === "cover" ? "100%" : "auto"} ref={contentRef}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody h="100%">
            {dialogContent}
          </DialogBody>
          {dialogFooter && <DialogFooter>{dialogFooter}</DialogFooter>}
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default Product;

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CategoryViewType } from '@entities/category.types';

import CategoriesList from './category-list';
import CategoryDetails from './category-details';
import CategoryHierarchy from './category-hierarchy';
import { CategoryExport } from './category-export';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
  DialogFooter} from '@ui/chakra/dialog';
import { useDisclosure } from '@chakra-ui/react';
import { CategoryFormCreate } from './category-form-create';
import { CategoryDeleteContent, CategoryDeleteFooter } from './category-delete';
import { CategoryFormUpdate } from './category-form-update';



interface CategoryComponentProps {
  viewType?: CategoryViewType;
  baseUrl?: string;
}

const Category: React.FC<CategoryComponentProps> = ({
  viewType = CategoryViewType.LIST,
  baseUrl = '/categories',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const categoryId = params.id;

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
      case CategoryViewType.NEW:
        setDialogTitle(t('categories.dialog.add_title'));
        setDialogContent(<CategoryFormCreate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        break;

      case CategoryViewType.EDIT:
        if (!categoryId) return navigate(baseUrl);
        setDialogTitle(t('categories.dialog.edit_title'));
        setDialogContent(<CategoryFormUpdate selectRef={contentRef as RefObject<HTMLElement>} />);
        setDialogFooter(null);
        break;

      case CategoryViewType.DELETE:
        if (!categoryId) return navigate(baseUrl);
        setDialogTitle(t('categories.dialog.delete_title'));
        setDialogContent(<CategoryDeleteContent />);
        setDialogFooter(<CategoryDeleteFooter />);
        break;

      case CategoryViewType.DETAILS:
        if (!categoryId) return navigate(baseUrl);
        setDialogTitle(t('categories.dialog.details_title'));
        setDialogContent(<CategoryDetails />);
        setDialogFooter(null);
        break;

      case CategoryViewType.HIERARCHY:
        setDialogTitle(t('categories.dialog.hierarchy_title'));
        setDialogContent(<CategoryHierarchy />);
        setDialogFooter(null);
        break;

      case CategoryViewType.HIERARCHY_SPECIFIC:
        if (!categoryId) return navigate(baseUrl);
        setDialogTitle(t('categories.dialog.hierarchy_title'));
        setDialogContent(<CategoryHierarchy />);
        setDialogFooter(null);
        break;
        
      case CategoryViewType.EXPORT:
        setDialogTitle(t('categories.dialog.export_title'));
        setDialogContent(<CategoryExport />);
        setDialogFooter(null);
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, viewType]);

  useEffect(() => {
    if (viewType === CategoryViewType.LIST) {
      onCloseDialog();
      hasInitializedRef.current = false;
    } else if (!hasInitializedRef.current) {
      configureDialog();
      onOpenDialog();
      hasInitializedRef.current = true;
    }
  }, [viewType, onOpenDialog, onCloseDialog, configureDialog]);

  useEffect(() => {
    if (viewType !== CategoryViewType.LIST && categoryId) {
      configureDialog();
    }
  }, [categoryId, configureDialog, viewType]);


  const handleCloseDialog = (): void => {
    onCloseDialog();
    navigate(baseUrl);
  };

  return (
    <>
      <CategoriesList viewType={viewType} />

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

export default Category;
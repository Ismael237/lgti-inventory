import { useNavigate, useParams } from 'react-router-dom';
import {
    DialogActionTrigger
} from '@ui/chakra/dialog';
import { useTranslation } from 'react-i18next';
import { Text } from '@chakra-ui/react';
import { Button } from '@ui/chakra/button';
import { useCategories } from '@hooks/use-categories';

export const CategoryDeleteFooter = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams<{ id?: string }>();
    const categoryId = params.id;
    const {
        deleteCategoryRequest
    } = useCategories();

    const {
        execute: deleteCategory,
        isLoading
    } = deleteCategoryRequest;

    return (
        <>
            <DialogActionTrigger asChild onClick={() => navigate("/categories")}>
                <Button variant="outline">{t('actions.cancel')}</Button>
            </DialogActionTrigger>
            <Button
                colorPalette="red"
                onClick={async () => {
                    await deleteCategory(Number(categoryId));
                    navigate("/categories");
                }}
                loading={isLoading}
            >
                {t('actions.delete')}
            </Button>
        </>
    )
}

export const CategoryDeleteContent = () => {
    const { t } = useTranslation();
    return (
        <>
            <Text>{t('categories.delete.confirm')}</Text>
        </>
    )
}
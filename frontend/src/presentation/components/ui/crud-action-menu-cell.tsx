import { LuEye, LuPenLine, LuTrash2 } from "react-icons/lu";
import { ActionMenuCell, type ActionOption } from "@ui/action-menu-cell";
import { useTranslation } from "react-i18next";

interface CrudActionMenuCellProps {
    editUrl?: string;
    editLabel?: string;
    editIcon?: React.ReactElement;

    deleteUrl?: string;
    deleteLabel?: string;
    deleteIcon?: React.ReactElement;

    viewUrl?: string;
    viewLabel?: string;
    viewIcon?: React.ReactElement;

    ariaLabel?: string;
    menuButtonSize?: string;
    additionalOptions?: ActionOption[];
}

export const CrudActionMenuCell: React.FC<CrudActionMenuCellProps> = ({
    viewUrl,
    editUrl,
    deleteUrl,
    viewLabel,
    editLabel,
    deleteLabel,
    viewIcon = <LuEye size={16} />,
    editIcon = <LuPenLine size={16} />,
    deleteIcon = <LuTrash2 size={16} />,
    additionalOptions = [],
}) => {
    const { t } = useTranslation();
    const allOptions: ActionOption[] = [
        ...additionalOptions,
        {
            label: viewLabel || t('actions.view'),
            icon: viewIcon,
            to: viewUrl
        },
        {
            label: editLabel || t('actions.edit'),
            icon: editIcon,
            to: editUrl
        },
        {
            label: deleteLabel || t('actions.delete'),
            icon: deleteIcon,
            to: deleteUrl,
            status: "danger"
        },
    ];
    return (
        <ActionMenuCell options={allOptions} />
    )
}
/**
 * Component utility functions for UI display components
 */

import type { ReactNode } from 'react';
import { Badge, type BadgeProps } from '@chakra-ui/react';
import type { Category } from '@entities/category.types';

/**
 * Get a Badge component with appropriate color based on status
 * @param status - Status string
 * @param colorMap - Optional mapping of status values to badge colors
 * @param fallbackColor - Fallback color if status not found in map (default: "gray")
 * @returns Badge component with appropriate styling
 */
export const getStatusBadge = (
  status: string | null | undefined,
  colorMap: Record<string, string> = {},
  fallbackColor: string = "gray"
): ReactNode => {
  if (!status) {
    return <Badge colorPalette="gray">Unknown</Badge>;
  }
  
  const displayText = status.charAt(0).toUpperCase() + 
    status.slice(1).toLowerCase().replace(/_/g, ' ');
  
  const color = status in colorMap ? colorMap[status] : fallbackColor;
  
  return <Badge colorPalette={color}>{displayText}</Badge>;
};

/**
 * Default status color mappings for common status values
 */
export const defaultStatusColors: Record<string, string> = {
  active: "green",
  published: "green",
  draft: "yellow",
  archived: "gray",
  pending: "orange",
  rejected: "red",
  deleted: "red",
  root: "brand"
};

/**
 * Get a color scheme based on item type
 * @param type - Item type string
 * @param typeColorMap - Mapping of types to colors
 * @param fallbackColor - Fallback color if type not found (default: "brand")
 * @returns Color scheme string
 */
export const getTypeColor = (
  type: string | null | undefined,
  typeColorMap: Record<string, string> = {},
  fallbackColor: string = "brand"
): string => {
  if (!type) return fallbackColor;
  return type in typeColorMap ? typeColorMap[type] : fallbackColor;
};

/**
 * Create a category badge based on parent relationship
 * @param category - Category object
 * @param categories - Array of all categories
 * @param badgeProps - Additional props for Badge component
 * @returns Badge component with appropriate styling and text
 */
export const getCategoryBadge = (
  category: Category,
  badgeProps: Partial<BadgeProps> = {}
): ReactNode => {
  const parentCategory = category.parent_id;

  if (!parentCategory) {
    return <Badge colorPalette="brand" {...badgeProps}>Root Category</Badge>;
  }
  
  return parentCategory.name;
};

/**
 * Create boolean indicator badge
 * @param value - Boolean value
 * @param trueProps - Badge props for true value (default: green badge with "Yes")
 * @param falseProps - Badge props for false value (default: gray badge with "No")
 * @returns Badge component based on boolean value
 */
export const getBooleanBadge = (
  value: boolean | null | undefined,
  trueProps: Partial<BadgeProps> & { text?: string } = { colorPalette: "green", text: "Yes" },
  falseProps: Partial<BadgeProps> & { text?: string } = { colorPalette: "gray", text: "No" }
): ReactNode => {
  if (value === null || value === undefined) {
    return <Badge colorPalette="gray">N/A</Badge>;
  }
  
  const { text: trueText = "Yes", ...trueRest } = trueProps;
  const { text: falseText = "No", ...falseRest } = falseProps;
  
  return value
    ? <Badge {...trueRest}>{trueText}</Badge>
    : <Badge {...falseRest}>{falseText}</Badge>;
};
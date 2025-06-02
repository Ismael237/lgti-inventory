/**
 * Utility functions for formatting various data types
 * @module utils/format
 */

import type { DirectusUser } from "@directus/sdk";
import type { Category } from "@entities/category.types";

/**
 * Formats a date into a localized string representation
 *
 * @param {Date | string | number} date - The date to format (Date object, ISO string, or timestamp)
 * @param {Intl.DateTimeFormatOptions} options - Formatting options following Intl.DateTimeFormat API
 * @param {string} locale - The locale to use for formatting (defaults to browser's locale)
 * @returns {string} The formatted date string
 *
 * @example
 * // Returns "Jan 5, 2023"
 * formatDate(new Date(2023, 0, 5))
 *
 * @example
 * // Returns "05/01/2023" with French locale
 * formatDate(new Date(2023, 0, 5), { day: '2-digit', month: '2-digit', year: 'numeric' }, 'fr-FR')
 */
export const formatDate = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    },
    locale: string = navigator.language
): string => {
    // Convert to Date object if string or number
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formats a number as currency
 *
 * @param {number} value - The numeric value to format
 * @param {string} currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param {string} locale - The locale to use for formatting (defaults to browser's locale)
 * @returns {string} The formatted currency string
 *
 * @example
 * // Returns "$1,234.56" with en-US locale
 * formatCurrency(1234.56, 'USD')
 */
export const formatCurrency = (
    value: number,
    currencyCode: string = 'EUR',
    locale: string = 'fr-FR'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    }).format(value);
};


/**
 * Formats a number as XAF currency
 *
 * @param {number} value - The numeric value to format
 * @param {string} locale - The locale to use for formatting (defaults to 'fr-FR')
 * @returns {string} The formatted XAF currency string
 *
 * @example
 * // Returns "1 234,56 FCFA" with fr-FR locale
 * formatXAFCurrency(1234.56)
 */
export const formatXAFCurrency = (
    value: number,
    locale: string = 'fr-FR'
): string => {
    return formatCurrency(value, 'XAF', locale);
};

/**
 * Converts an amount from EUR to XAF
 *
 * @param {number} eurAmount - The amount in EUR
 * @param {number} conversionRate - The conversion rate from EUR to XAF (default: 655.957)
 * @returns {number} The amount converted to XAF
 *
 * @example
 * // Returns 655957 (1000 EUR converted to XAF)
 * convertEURtoXAF(1000)
 */
export const convertEURtoXAF = (
    eurAmount: number,
    conversionRate: number = 656
): number => {
    return eurAmount * conversionRate;
};

/**
 * Converts an amount from XAF to EUR with two decimal places
 *
 * @param {number} xafAmount - The amount in XAF
 * @param {number} conversionRate - The conversion rate from XAF to EUR (default: 0.001524)
 * @returns {number} The amount converted to EUR with two decimal places
 *
 * @example
 * // Returns 0.1524 (100000 XAF converted to EUR)
 * convertXAFtoEUR(100000)
 */
export const convertXAFtoEUR = (
    xafAmount: number,
    conversionRate: number = 0.00152439
): number => {
    return Number((xafAmount * conversionRate).toFixed(2));
};

/**
 * Formats a price in EUR with its XAF equivalent in parentheses
 *
 * @param {number} eurAmount - The amount in EUR
 * @param {number} conversionRate - The conversion rate from EUR to XAF (default: 655.957)
 * @param {string} locale - The locale to use for formatting (defaults to 'fr-FR')
 * @returns {string} Formatted string with EUR price and XAF equivalent in parentheses
 *
 * @example
 * // Returns "10,00 € (6 559,57 FCFA)" with fr-FR locale
 * formatEURwithXAF(10)
 */
export const formatEURwithXAF = (
    eurAmount: number,
    conversionRate: number = 656,
    locale: string = 'fr-FR'
): string => {
    const xafAmount = convertEURtoXAF(eurAmount, conversionRate);
    const formattedEUR = formatCurrency(eurAmount, 'EUR', locale);
    const formattedXAF = formatXAFCurrency(xafAmount, locale);
    
    return `${formattedEUR} (${formattedXAF})`;
};


/**
 * Formats a number with thousands separators and decimal places
 *
 * @param {number} value - The numeric value to format
 * @param {number} decimalPlaces - Number of decimal places to display
 * @param {string} locale - The locale to use for formatting (defaults to browser's locale)
 * @returns {string} The formatted number string
 *
 * @example
 * // Returns "1,234.56" with en-US locale
 * formatNumber(1234.56, 2)
 */
export const formatNumber = (
    value: number,
    decimalPlaces: number = 2,
    locale: string = navigator.language
): string => {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    }).format(value);
};

/**
 * Capitalizes the first letter of each word in a string
 *
 * @param {string} text - The input string
 * @returns {string} The transformed string with capitalized words
 *
 * @example
 * // Returns "Hello World"
 * capitalizeWords("hello world")
 */
export const capitalizeWords = (text: string): string => {
    if (!text) return '';

    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Format value with a fallback for null/undefined values
 * @param value - The value to format
 * @param fallback - Fallback text to display when value is null/undefined (default: "N/A")
 * @returns Formatted value or fallback text
 */
export const formatNullableValue = <T>(value: T | null | undefined, fallback: string = "N/A"): string => {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value);
};

/**
 * Format a Directus user's full name
 * @param user - Directus user object
 * @param fallback - Fallback text when user is null (default: "N/A")
 * @returns Formatted full name or fallback text
 */
export const formatUserFullName = (user: DirectusUser | null | undefined, fallback: string = "N/A"): string => {
    if (!user) {
        return fallback;
    }

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";

    if (!firstName && !lastName) {
        return user.email || fallback;
    }

    return capitalizeWords(`${firstName} ${lastName}`.trim());
};

/**
 * Format date with custom options and fallback for null values
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions object
 * @param fallback - Fallback text when date is null/invalid (default: "N/A")
 * @returns Formatted date string or fallback text
 */
export const formatDateWithFallback = (
    date: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    },
    fallback: string = "N/A"
): string => {
    if (!date) {
        return fallback;
    }

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('fr-Fr', options).format(dateObj);
    } catch (error) {
        console.error("Error formatting date:", error);
        return fallback;
    }
};

/**
 * Formats a given Date object into a string suitable for filenames.
 *
 * The format used is: `dd-mm-yyyy_HH-MM`, where:
 * - `dd` is the day (2 digits)
 * - `mm` is the month (2 digits)
 * - `yyyy` is the 4-digit year
 * - `HH` is the hour in 24-hour format (2 digits)
 * - `MM` is the minutes (2 digits)
 * 
 * This format avoids special characters like colons (:) that are not allowed in filenames
 * on some operating systems and ensures consistent, sortable filenames.
 * 
 * @param {Date} [date=new Date()] - The date to format. Defaults to the current date and time if not provided.
 * @returns {string} A string formatted as `dd-mm-yyyy_HH-MM`, suitable for use in filenames.
 */
export const formatDateForFilename = (date: Date = new Date()): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}-${month}-${year}_${hours}-${minutes}`;
};


/**
 * Format category parent information
 * @param category - Category object
 * @param categories - Array of all categories
 * @param rootLabel - Label to display for root categories (default: "Root Category")
 * @returns Parent category name or root label
 */
export const formatCategoryParent = (
    category: Category,
    categories: Category[] | null | undefined,
    rootLabel: string = "Root Category"
): string => {
    if (!category.parent_id) {
        return rootLabel;
    }

    if (!categories || categories.length === 0) {
        return `ID: ${typeof category.parent_id === 'object' ? category.parent_id.id : category.parent_id}`;
    }

    const parentId = typeof category.parent_id === 'object' ? category.parent_id.id : category.parent_id;
    const parentCategory = categories.find(c => c.id === parentId);

    return parentCategory?.name || `ID: ${parentId}`;
};

/**
 * Truncate text to a specific length and add ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50, fallback: string = "N/A"): string => {
    if (!text) return fallback;

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a boolean value to a user-friendly text
 * @param value - Boolean value
 * @param trueText - Text to display for true (default: "Yes")
 * @param falseText - Text to display for false (default: "No")
 * @param fallback - Fallback text when value is null (default: "N/A")
 * @returns Formatted boolean text
 */
export const formatBoolean = (
    value: boolean | null | undefined,
    trueText: string = "Yes",
    falseText: string = "No",
    fallback: string = "N/A"
): string => {
    if (value === null || value === undefined) {
        return fallback;
    }

    return value ? trueText : falseText;
};


/**
 * Formats a number into a social-media style string (e.g., 1.2k, 3M).
 *
 * Supports thousand (k), million (M), billion (B), trillion (T) suffixes.
 * Values below 1000 are returned as-is (no suffix).
 *
 * @param value - The number to format.
 * @param precision - The number of decimal places to include for values above threshold. Defaults to 1.
 *                    For example, with precision = 1: 1200 → "1.2k"; with precision = 2: 1234 → "1.23k".
 * @returns A formatted string with appropriate suffix, or the original number string if below 1000.
 *
 * @example
 * formatSocialNumber(950);        // "950"
 * formatSocialNumber(1000);       // "1k"
 * formatSocialNumber(1200);       // "1.2k"
 * formatSocialNumber(15000, 2);   // "15.00k"
 * formatSocialNumber(2500000);    // "2.5M"
 * formatSocialNumber(7200000000); // "7.2B"
 */
export function formatSocialNumber(value: number, precision = 1): string {
    const absValue = Math.abs(value);
  
    const thresholds: { value: number; suffix: string }[] = [
      { value: 1e12, suffix: 'T' },
      { value: 1e9,  suffix: 'B' },
      { value: 1e6,  suffix: 'M' },
      { value: 1e3,  suffix: 'k' },
    ];
  
    for (const { value: threshold, suffix } of thresholds) {
      if (absValue >= threshold) {
        const formatted = (value / threshold).toFixed(precision);
        // Remove unnecessary trailing zeros and dot
        const cleaned = parseFloat(formatted).toString();
        return `${cleaned}${suffix}`;
      }
    }
  
    // For values less than 1000, just return the number as string
    return value.toString();
  }

/**
 * Formats a number as a compact social-style currency value in EUR,
 * optionally appending its XAF equivalent.
 *
 * @param value - The amount in EUR to format.
 * @param precision - Decimal places for compact formatting (default: 1).
 * @param showXaf - Whether to display the equivalent in FCFA (default: true).
 * @returns A formatted string like: "1.2k € (786.3k FCFA)" or just "1.2k €"
 *
 * @example
 * formatSocialCurrency(1200);
 * // → "1.2k € (786.3k FCFA)"
 *
 * formatSocialCurrency(1200, 1, false);
 * // → "1.2k €"
 */
export function formatSocialCurrency(value: number, precision: number = 1, showXaf: boolean = true): string {
    const euroFormatted = formatSocialNumber(value, precision);
    if (!showXaf) return `${euroFormatted} €`;
  
    const xafFormatted = formatSocialNumber(convertEURtoXAF(value), precision);
    return `${euroFormatted} € (${xafFormatted} FCFA)`;
  }
  
  
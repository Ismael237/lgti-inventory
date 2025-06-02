/**
 * Language type for supported languages
 */
type Language = 'fr' | 'en';

/**
 * Configuration interface for the number to words converter
 */
interface NumberToWordsConfig {
  /** Language for the conversion ('fr' for French, 'en' for English) */
  language?: Language;
  /** Whether to use feminine form for French (e.g., "une" instead of "un") */
  feminine?: boolean;
}

/**
 * Converts a number to its written form in French or English
 *
 * @param num - The number to convert (supports integers from 0 to 999,999,999,999,999)
 * @param config - Configuration options for the conversion
 * @param config.language - Target language ('fr' for French, 'en' for English). Defaults to 'fr'
 * @param config.feminine - Whether to use feminine form in French. Defaults to false
 * @returns The number written in words
 *
 * @example
 * ```typescript
 * // French (default)
 * numberToWords(1000000); // "un million"
 * numberToWords(1234567); // "un million deux cent trente-quatre mille cinq cent soixante-sept"
 * numberToWords(1, { feminine: true }); // "une"
 *
 * // English
 * numberToWords(1000000, { language: 'en' }); // "one million"
 * numberToWords(1234567, { language: 'en' }); // "one million two hundred thirty-four thousand five hundred sixty-seven"
 * ```
 *
 * @throws {Error} When the number is outside the supported range or not an integer
 */
function numberToWords(num: number, config: NumberToWordsConfig = {}): string {
  const { language = 'fr', feminine = false } = config;

  // Validation
  if (!Number.isInteger(num)) {
    throw new Error('Only integers are supported');
  }
  
  if (num < 0 || num > 999999999999999) {
    throw new Error('Number must be between 0 and 999,999,999,999,999');
  }

  if (num === 0) {
    return language === 'fr' ? 'zéro' : 'zero';
  }

  // French number words
  const frenchUnits = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const frenchTens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const frenchTeens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

  // English number words
  const englishUnits = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const englishTens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const englishTeens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  /**
   * Converts a number below 1000 to words
   */
  function convertHundreds(n: number): string {
    if (n === 0) return '';

    const units = language === 'fr' ? frenchUnits : englishUnits;
    const tens = language === 'fr' ? frenchTens : englishTens;
    const teens = language === 'fr' ? frenchTeens : englishTeens;

    let result = '';

    // Hundreds
    const hundreds = Math.floor(n / 100);
    if (hundreds > 0) {
      if (language === 'fr') {
        if (hundreds === 1) {
          result += 'cent';
        } else {
          result += units[hundreds] + ' cent';
          if (n % 100 === 0) result += 's'; // "cents" when no remainder
        }
      } else {
        result += units[hundreds] + ' hundred';
      }
    }

    // Tens and units
    const remainder = n % 100;
    if (remainder > 0) {
      if (result) result += language === 'fr' ? ' ' : ' ';

      if (remainder < 10) {
        let unit = units[remainder];
        // Handle feminine form in French
        if (language === 'fr' && feminine && remainder === 1) {
          unit = 'une';
        }
        result += unit;
      } else if (remainder < 20) {
        result += teens[remainder - 10];
      } else {
        const tensDigit = Math.floor(remainder / 10);
        const unitsDigit = remainder % 10;

        if (language === 'fr') {
          // French special cases
          if (tensDigit === 7) { // 70-79
            result += 'soixante';
            if (unitsDigit === 0) {
              result += '-dix';
            } else if (unitsDigit === 1) {
              result += ' et onze';
            } else {
              result += '-' + teens[unitsDigit - 0];
            }
          } else if (tensDigit === 9) { // 90-99
            result += 'quatre-vingt';
            if (unitsDigit === 0) {
              result += '-dix';
            } else if (unitsDigit === 1) {
              result += ' et onze';
            } else {
              result += '-' + teens[unitsDigit - 0];
            }
          } else {
            result += tens[tensDigit];
            if (unitsDigit > 0) {
              if ((tensDigit === 2 || tensDigit === 3 || tensDigit === 4 || tensDigit === 5 || tensDigit === 6) && unitsDigit === 1) {
                result += ' et un';
              } else {
                result += '-' + units[unitsDigit];
              }
            } else if (tensDigit === 8) {
              result += 's'; // "quatre-vingts"
            }
          }
        } else {
          // English
          result += tens[tensDigit];
          if (unitsDigit > 0) {
            result += '-' + units[unitsDigit];
          }
        }
      }
    }

    return result;
  }

  // Scale words
  const scaleWords = language === 'fr' 
    ? ['', 'mille', 'million', 'milliard', 'billion']
    : ['', 'thousand', 'million', 'billion', 'trillion'];

  const groups: number[] = [];
  let tempNum = num;

  // Split number into groups of 3 digits
  while (tempNum > 0) {
    groups.unshift(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }

  const parts: string[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const scaleIndex = groups.length - 1 - i;

    if (group === 0) continue;

    let groupText = convertHundreds(group);

    // Special handling for French "mille"
    if (language === 'fr' && scaleIndex === 1 && group === 1) {
      groupText = 'mille';
    } else if (scaleIndex > 0) {
      if (language === 'fr' && scaleIndex > 1 && group > 1) {
        groupText += ' ' + scaleWords[scaleIndex] + 's';
      } else {
        groupText += ' ' + scaleWords[scaleIndex];
      }
    }

    parts.push(groupText);
  }

  return parts.join(' ').trim();
}

export { numberToWords, type NumberToWordsConfig, type Language };
import { Replacer } from '../internal/replacer'

const escapeReplacer = new Replacer({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
})

const unescapeReplacer = new Replacer({
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&apos;': "'",
  '&#39;': "'",
  '&quot;': '"',
  '&#34;': '"'
})

/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`
 * @param {string} input
 */
export function escape(input: string): string {
  return escapeReplacer.replace(input)
}

/**
 * Unescape HTML entities such as `&`, `<`, `>`, `"`, and `'`
 * @param {string} input
 */
export function unescape(input: string): string {
  return unescapeReplacer.replace(input)
}

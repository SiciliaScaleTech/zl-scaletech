/**
 * Sérialise des données pour les injecter dans un bloc <script type="application/json">
 * ou <script type="application/ld+json">.
 *
 * JSON.stringify n'échappe pas « < » : un contenu contenant « </script> » fermerait
 * le bloc et pourrait injecter du HTML ou du JavaScript (XSS). On échappe donc
 * <, >, & et les séparateurs de ligne Unicode ; le JSON obtenu reste strictement équivalent.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function safeJson(value: unknown): string {
	return JSON.stringify(value)
		.replaceAll('<', '\\u003c')
		.replaceAll('>', '\\u003e')
		.replaceAll('&', '\\u0026')
		.replaceAll(LINE_SEPARATOR, '\\u2028')
		.replaceAll(PARAGRAPH_SEPARATOR, '\\u2029');
}

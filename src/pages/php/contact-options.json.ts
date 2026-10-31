/**
 * Exporte au build les options du formulaire (dist/php/contact-options.json),
 * lues par le script PHP pour valider le type de projet et l'offre reçus.
 */
import type { APIRoute } from 'astro';
import { PROJECT_TYPES } from '../../data/contact';

export const GET: APIRoute = () =>
	new Response(
		JSON.stringify(
			Object.fromEntries(
				PROJECT_TYPES.map((type) => [
					type.id,
					{ label: type.label, offers: Object.fromEntries(type.offers.map((offer) => [offer.value, offer.label])) },
				]),
			),
		),
	);

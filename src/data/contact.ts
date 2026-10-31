/**
 * Options du formulaire de contact : types de projet et offres associées.
 * Générées à partir des grilles d'offres et de maintenance, puis exportées
 * en JSON (/php/contact-options.json) pour que le script PHP valide
 * exactement les mêmes valeurs que celles affichées.
 *
 * Les valeurs d'offre reprennent les paramètres d'URL envoyés par le site :
 * `?offre=essentiel-vitrine` (page /offres) et `?maintenance=vitrine-serenite-annuel` (configurateur).
 */
import { MAINTENANCE_PLANS, SITE_TYPES } from './maintenance';
import { OFFERS, offerPrice, type SiteType } from './offres';

export interface ContactOption { value: string; label: string; }
export interface ProjectType { id: string; label: string; offers: ContactOption[]; }

const siteLabel = (site: SiteType) => SITE_TYPES.find((s) => s.id === site)?.label.toLowerCase() ?? site;

/** Offres WordPress d'un type de site (hors Sur mesure, qui a son propre type de projet). */
const creationOffers = (site: SiteType): ContactOption[] =>
	OFFERS.filter((offer) => !offer.only && offer.variants[site]).map((offer) => ({
		value: `${offer.id}-${site}`,
		label: `${offer.name} : ${offerPrice(offer.variants[site]!)}`,
	}));

const maintenanceOffers: ContactOption[] = [
	...Object.values(MAINTENANCE_PLANS).map((plan) => {
		const site = plan.key.startsWith('e-commerce') ? 'e-commerce' : 'vitrine';
		return { value: plan.key, label: `${plan.title} (${siteLabel(site)}) : ${plan.price} ${plan.unit}` };
	}),
	{ value: 'sur-demande', label: 'Pack Sur demande (interventions ponctuelles)' },
];

export const PROJECT_TYPES: ProjectType[] = [
	{ id: 'vitrine', label: 'Site vitrine', offers: creationOffers('vitrine') },
	{ id: 'e-commerce', label: 'Site e-commerce', offers: creationOffers('e-commerce') },
	{ id: 'sur-mesure', label: 'Site sur mesure', offers: [] },
	{ id: 'maintenance', label: 'Maintenance', offers: maintenanceOffers },
	{ id: 'autre', label: 'Autre demande', offers: [] },
];

/** Correspondance d'un paramètre `?offre=` vers son type de projet (ex. sur-mesure-vitrine → sur-mesure). */
export const OFFER_ALIASES: Record<string, string> = { 'sur-mesure-vitrine': 'sur-mesure' };

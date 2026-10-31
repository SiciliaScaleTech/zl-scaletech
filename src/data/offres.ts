/**
 * Grille des offres de création de site (vitrine, e-commerce, sur mesure).
 * Source unique : utilisée par la page /offres et l'aperçu de la page d'accueil.
 * Tous les montants sont HT.
 */
import { formatPrice } from './maintenance';

export type SiteType = 'vitrine' | 'e-commerce';

export interface OfferVariant {
	/** Prix HT, ou null pour « Sur devis ». */
	price: number | null;
	delay: string;
	/** Phrase courte pour l'aperçu de la page d'accueil. */
	teaser: string;
	included: string[];
	/** Mention affichée sous la liste (limites, cas particuliers). */
	note?: string;
}

export interface Offer {
	id: string;
	name: string;
	label: string;
	/** Condition d'accès affichée en évidence. */
	condition?: string;
	featured?: boolean;
	/** Offre réservée à un seul type de site (masquée pour l'autre). */
	only?: SiteType;
	variants: Partial<Record<SiteType, OfferVariant>>;
}

const payment = 'Moyens de paiement installés (CB, PayPal, Stripe…) : prêt à vendre dès la livraison';
const support = '1 mois de support offert';

export const OFFERS: Offer[] = [
	{
		id: 'starter-entrepreneur',
		name: 'Starter Entrepreneur',
		label: 'Pour démarrer',
		condition: "Réservé aux entreprises dans leur 1re année d'activité ou réalisant moins de 30 000 € de chiffre d'affaires annuel",
		variants: {
			vitrine: {
				price: 600,
				delay: '2 à 3 semaines',
				teaser: 'Un site de 3 pages pour lancer votre activité avec une présence professionnelle.',
				included: [
					'3 pages : Accueil, Contact et 1 page légale regroupée',
					'1 template Premium (maquette), 1 cycle de retouches',
					'Formulaire de contact sécurisé (anti-spam)',
					'SEO de base (balises, titres)',
					'Site responsive (ordinateur, tablette, mobile)',
					support,
				],
			},
			'e-commerce': {
				price: 1200,
				delay: '4 à 5 semaines',
				teaser: "Une boutique jusqu'à 10 produits, prête à vendre dès la livraison.",
				included: [
					"Jusqu'à 10 produits",
					"Jusqu'à 6 pages : Accueil, Boutique, Contact, Panier et Commande (générées automatiquement), 1 page légale regroupée",
					payment,
					'Un mode de livraison simple configuré',
					'1 template Premium (maquette), 1 cycle de retouches',
					'SEO de base, site responsive',
					support,
				],
			},
		},
	},
	{
		id: 'essentiel',
		name: 'Essentiel',
		label: "Pour l'essentiel",
		featured: true,
		variants: {
			vitrine: {
				price: 1200,
				delay: '3 à 5 semaines',
				teaser: 'Un site de 5 pages pour présenter votre métier, vos services et votre savoir-faire.',
				included: [
					'5 pages : Accueil, À propos, Services, Contact, 1 page légale regroupée',
					'2 templates Premium (maquettes), accompagnement et validation de la maquette',
					'Formulaire de contact sécurisé, gestion des cookies (bannière et conformité)',
					'SEO avancé (balises, titres, vitesse de chargement)',
					'Protection contre les failles courantes, optimisation des performances (cache, minification)',
					"Outil de suivi d'audience",
					support,
				],
			},
			'e-commerce': {
				price: 1900,
				delay: '5 à 7 semaines',
				teaser: "Une boutique jusqu'à 20 produits, paiement et livraison configurés.",
				included: [
					"Jusqu'à 20 produits",
					"Jusqu'à 10 pages : Accueil, Boutique, catégories, À propos, Contact, pages légales",
					'2 templates Premium (maquettes), accompagnement et validation de la maquette',
					payment,
					'Modes de livraison configurés',
					'Formulaire de contact sécurisé, gestion des cookies',
					'SEO avancé, sécurité renforcée, optimisation des performances',
					"Outil de suivi d'audience",
					support,
				],
			},
		},
	},
	{
		id: 'business',
		name: 'Business',
		label: 'Pour se développer',
		variants: {
			vitrine: {
				price: 1800,
				delay: '4 à 6 semaines',
				teaser: "Jusqu'à 10 pages pour détailler vos savoir-faire et montrer vos réalisations.",
				included: [
					"Jusqu'à 10 pages : Accueil, À propos, Services (pages dédiées si besoin), Réalisations, Contact avec formulaire et calendrier, pages légales",
					'2 templates Premium (maquettes), accompagnement, ajustement et validation complète de la maquette',
					'Formulaire de contact sécurisé (anti-spam), gestion des cookies',
					'SEO avancé (balises, titres, vitesse de chargement)',
					'Protection contre les principales failles, optimisation des performances (cache, minification)',
					"Outil de suivi d'audience",
					'Vérification complète du responsive, de la sécurité et des performances avant mise en ligne',
					support,
				],
			},
			'e-commerce': {
				price: 2900,
				delay: '6 à 8 semaines',
				teaser: "Jusqu'à 40 produits, parcours de commande testé avant la mise en ligne.",
				included: [
					"Jusqu'à 40 produits",
					"Jusqu'à 10 pages : Accueil, Boutique, À propos, catégories et produits, Panier, Commande, Contact, pages légales",
					'2 templates Premium (maquettes), accompagnement, ajustement et validation complète',
					payment,
					'Modes de livraison configurés',
					'Formulaire de contact sécurisé, gestion des cookies',
					'SEO avancé, sécurité renforcée, optimisation des performances',
					'Tests complets du parcours de commande avant mise en ligne',
					"Outil de suivi d'audience",
					support,
				],
				note: 'Plus de 40 produits ou besoins spécifiques (fonctionnalités avancées, multi-devises…) : devis e-commerce sur mesure.',
			},
		},
	},
	{
		id: 'sur-mesure',
		name: 'Sur mesure',
		label: 'Pour les projets singuliers',
		only: 'vitrine',
		variants: {
			vitrine: {
				price: null,
				delay: 'Délai défini lors du cadrage',
				teaser: 'Un site codé à la main, comme une pièce unique, pensé autour de votre identité.',
				included: [
					"Développement 100 % personnalisé, hors WordPress, avec l'appui de l'intelligence artificielle",
					'Sécurité renforcée : aucun CMS tiers exposé, aucun plugin vulnérable',
					'Performance optimale',
					'Design original, pensé autour de votre identité',
					'Cadrage initial (besoins, fonctionnalités, volumétrie) avant le devis',
				],
			},
		},
	},
];

/** « 1 200 € HT » ou « Sur devis ». */
export const offerPrice = (variant: OfferVariant) => (variant.price === null ? 'Sur devis' : formatPrice(variant.price));

/** Conditions communes à toutes les offres. */
export const OFFER_TERMS = {
	provide: [
		'Les contenus textuels (textes des pages)',
		'Les visuels (photos, logos, images)',
		'Pour l’e-commerce : le catalogue produits (prix, descriptions, visuels)',
	],
	process: [
		'Prestation réalisée à distance',
		'Les délais peuvent être prolongés si les contenus nous parviennent en retard',
		'Toute demande hors périmètre fait l’objet d’un devis complémentaire',
	],
	payment: [
		'50 % à la signature du devis : l’acompte lance le projet',
		'50 % à la livraison du site, avant la mise en ligne',
	],
	excluded: [
		'Nom de domaine (à la charge du client)',
		'Hébergement et maintenance après livraison (voir nos offres de maintenance)',
		'Extensions ou applications premium payantes',
		'Langues supplémentaires',
		'Interventions hors périmètre (possibles via le pack Sur demande)',
	],
};

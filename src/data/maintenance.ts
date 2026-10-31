/**
 * Grille tarifaire de la maintenance WordPress.
 * Source unique des prix : utilisée par la page /maintenance (configurateur)
 * et par l'aperçu de la page d'accueil. Tous les montants sont HT.
 */

export type SiteType = 'vitrine' | 'e-commerce';
export type Formula = 'starter' | 'serenite';
export type Period = 'mensuel' | 'trimestriel' | 'annuel';

export const SITE_TYPES: { id: SiteType; label: string }[] = [
	{ id: 'vitrine', label: 'Site vitrine' },
	{ id: 'e-commerce', label: 'E-commerce' },
];

export const FORMULAS: { id: Formula; label: string; tagline: string }[] = [
	{ id: 'starter', label: 'Starter Entrepreneur', tagline: "L'essentiel pour démarrer" },
	{ id: 'serenite', label: 'Sérénité', tagline: 'Suivi complet et modifications' },
];

export const PERIODS: { id: Period; label: string; badge?: string }[] = [
	{ id: 'mensuel', label: 'Mensuel' },
	{ id: 'trimestriel', label: 'Trimestriel', badge: '-7 %' },
	{ id: 'annuel', label: 'Annuel', badge: '2 mois offerts' },
];

/** Prix de base par type de site. */
const PRICES = {
	vitrine: { starter: 49, mensuel: 99, trimestriel: 276, annuel: 990, heuresAnnuelles: 5 },
	'e-commerce': { starter: 79, mensuel: 149, trimestriel: 416, annuel: 1490, heuresAnnuelles: 7 },
} as const;

/** Pack « Sur demande » : interventions ponctuelles hors forfait. */
export const ON_DEMAND = {
	packs: [
		{ hours: 1, price: 80 },
		{ hours: 10, price: 700 },
		{ hours: 20, price: 1200 },
	],
	coverage: [
		'Mise à jour et création de contenus',
		'Modifications graphiques',
		'Assistance back-office',
		'Mises à jour techniques hors maintenance récurrente',
		'Gestion et restauration de sauvegardes',
		'Vérifications de sécurité',
		'Interventions techniques diverses',
		"Gestion de l'hébergement",
	],
};

// Montants ronds sans décimales (« 99 € »), sinon toujours deux décimales (« 82,50 € »).
const euroWhole = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const euroCents = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const euro = { format: (amount: number) => (Number.isInteger(amount) ? euroWhole : euroCents).format(amount) };
/** Formate un montant : « 1 490 € HT » (espaces insécables). */
export const formatPrice = (amount: number) => `${euro.format(amount).replace(/\s/g, ' ')} € HT`;

/** Une combinaison type de site × formule × période, prête à afficher. */
export interface MaintenancePlan {
	key: string;
	title: string;
	price: string;
	unit: string;
	/** Équivalent mensuel, affiché pour le trimestriel et l'annuel. */
	monthly?: string;
	/** Économie réalisée par rapport au paiement mensuel. */
	saving?: string;
	badge?: string;
	engagement: string;
	included: string[];
	excluded: string[];
	conditions: string[];
}

export const planKey = (site: SiteType, formula: Formula, period: Period) =>
	formula === 'starter' ? `${site}-starter` : `${site}-serenite-${period}`;

const shopCheck = 'Vérification de la boutique après chaque mise à jour (panier, commande, paiement)';

function starterPlan(site: SiteType): MaintenancePlan {
	const isShop = site === 'e-commerce';
	return {
		key: planKey(site, 'starter', 'mensuel'),
		title: 'Starter Entrepreneur',
		price: formatPrice(PRICES[site].starter),
		unit: 'par mois',
		engagement: 'Sans engagement',
		included: [
			'Mises à jour mensuelles (WordPress, thèmes, plugins)',
			'Sauvegardes multi-versions sur plusieurs supports',
			'Vérifications de sécurité de base',
			...(isShop ? [shopCheck] : []),
			"Gestion de l'hébergement",
			'Support par e-mail, réponse sous 72 h ouvrées',
			'Rapport simplifié (confirmation des mises à jour)',
		],
		excluded: ['Modifications de contenu (facturées via le pack Sur demande)'],
		conditions: isShop
			? [
					'Accessible à toute boutique pendant la première année de maintenance.',
					'Ensuite : boutique jusqu’à 10 produits et 5 pages statiques (Accueil, À propos, Contact, Mentions légales, CGV). Au-delà, bascule automatique vers la formule Sérénité mensuelle.',
				]
			: [],
	};
}

function serenitePlan(site: SiteType, period: Period): MaintenancePlan {
	const p = PRICES[site];
	const isShop = site === 'e-commerce';
	const isYearly = period === 'annuel';
	const base = {
		mensuel: { amount: p.mensuel, months: 1, unit: 'par mois' },
		trimestriel: { amount: p.trimestriel, months: 3, unit: 'par trimestre' },
		annuel: { amount: p.annuel, months: 12, unit: 'par an' },
	}[period];
	const saving = p.mensuel * base.months - base.amount;

	return {
		key: planKey(site, 'serenite', period),
		title: 'Sérénité',
		price: formatPrice(base.amount),
		unit: base.unit,
		monthly: base.months > 1 ? `soit ${formatPrice(Math.round((base.amount / base.months) * 100) / 100)} par mois` : undefined,
		saving: saving > 0 ? `${formatPrice(saving)} économisés ${isYearly ? 'sur l’année' : 'par trimestre'}` : undefined,
		badge: PERIODS.find((item) => item.id === period)?.badge,
		engagement: isYearly ? 'Engagement 12 mois' : 'Sans engagement',
		included: [
			'Maintenance technique et optimisation',
			'Mises à jour mensuelles (WordPress, thèmes, plugins)',
			'Sauvegardes multi-versions sur plusieurs supports',
			...(isShop ? [shopCheck] : []),
			"Gestion de l'hébergement",
			'Support par e-mail et téléphone, réponse sous 48 h ouvrées',
			isYearly
				? `${p.heuresAnnuelles} h par an pour modifications ou interventions techniques`
				: '1 demande de modification par mois (contenus, images, actualités)',
			'Rapport mensuel complet',
			...(isYearly ? ['Suivi prioritaire'] : []),
		],
		excluded: [],
		conditions: isYearly
			? ['Engagement 12 mois, non remboursable.']
			: [],
	};
}

/** Toutes les combinaisons, indexées par clé, sérialisées pour le configurateur. */
export const MAINTENANCE_PLANS: Record<string, MaintenancePlan> = Object.fromEntries(
	SITE_TYPES.flatMap(({ id: site }) => [
		starterPlan(site),
		...PERIODS.map(({ id: period }) => serenitePlan(site, period)),
	]).map((plan) => [plan.key, plan]),
);

/** Valeurs « à partir de » pour l'aperçu de la page d'accueil, par type de site. */
export const MAINTENANCE_PREVIEW = {
	sites: SITE_TYPES.map(({ id }) => ({
		id,
		starter: formatPrice(PRICES[id].starter),
		serenite: formatPrice(PRICES[id].mensuel),
		yearly: formatPrice(PRICES[id].annuel),
	})),
	onDemand: { price: formatPrice(ON_DEMAND.packs[0].price) },
};

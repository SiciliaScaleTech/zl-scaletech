<?php
/**
 * Modèle de configuration du formulaire de contact.
 * À copier vers public/php/config.php (fichier exclu de Git) et à compléter.
 */
return [
	// Adresse qui reçoit les demandes.
	'to' => 'contact@example.com',
	// Adresse d'expédition, sur le domaine du site.
	'from' => 'no-reply@example.com',
	// Anti-abus : envois maximum par adresse IP sur la fenêtre donnée (en secondes).
	'rate_limit' => ['max' => 5, 'window' => 3600],
	// Plafond global d'e-mails envoyés par 24 h.
	'daily_max' => 50,
	// Dossier privé des compteurs et de la clé secrète, hors de la racine web.
	'storage_dir' => dirname(__DIR__, 2) . '/contact-data',
];

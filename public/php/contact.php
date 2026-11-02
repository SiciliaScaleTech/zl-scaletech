<?php
/**
 * Traitement du formulaire de contact (page /contact).
 *
 * Sécurité :
 * - erreurs PHP jamais affichées (pas de fuite de chemins ou de configuration) ;
 * - POST uniquement, contrôle de l'origine de la requête (anti-CSRF) ;
 * - pot de miel anti-spam ;
 * - limitation par IP et plafond global quotidien (anti-bombardement d'e-mails),
 *   compteurs verrouillés et stockés hors des dossiers web ;
 * - IP jamais stockée en clair : HMAC-SHA256 avec une clé secrète propre au serveur ;
 * - validation stricte de chaque champ ; type de projet et offre vérifiés contre
 *   la liste générée au build (contact-options.json) ;
 * - aucune donnée saisie dans les en-têtes de l'e-mail, sauf l'adresse de réponse,
 *   validée et sans retour à la ligne.
 *
 * Réponses : redirection 303 vers /contact/merci/ ou /contact/erreur/ (chemins fixes).
 */
declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
date_default_timezone_set('Europe/Paris');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const REDIRECT_OK = '/contact/merci/';
const REDIRECT_ERROR = '/contact/erreur/';

function redirect_to(string $path): void
{
	header('Location: ' . $path, true, 303);
	exit;
}

/** Valeur texte d'un champ POST, ou chaîne vide (tableaux et encodages invalides refusés). */
function field(string $name): string
{
	$value = $_POST[$name] ?? '';
	if (!is_string($value) || !mb_check_encoding($value, 'UTF-8')) {
		return '';
	}
	return trim($value);
}

/** Supprime retours à la ligne et caractères de contrôle (champs sur une ligne). */
function single_line(string $value): string
{
	return trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
}

/** Dossier privé des compteurs (hors des dossiers web), créé au besoin avec des droits restreints. */
function storage_dir(array $config): string
{
	$dir = (string) $config['storage_dir'];
	if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
		throw new RuntimeException('Dossier de stockage indisponible.');
	}
	return $dir;
}

/** Clé secrète aléatoire, générée une seule fois et conservée dans le dossier privé. */
function secret_key(string $dir): string
{
	$file = $dir . '/secret.key';
	if (!is_file($file)) {
		@file_put_contents($file, bin2hex(random_bytes(32)), LOCK_EX);
		@chmod($file, 0600);
	}
	$key = (string) @file_get_contents($file);
	if (strlen($key) !== 64) {
		throw new RuntimeException('Clé secrète indisponible.');
	}
	return $key;
}

/**
 * Enregistre une tentative dans un compteur verrouillé ; renvoie false si la limite est atteinte.
 * Les horodatages plus anciens que la fenêtre sont supprimés à chaque passage.
 */
function hit_allowed(string $file, int $max, int $window): bool
{
	$handle = @fopen($file, 'c+');
	if ($handle === false || !flock($handle, LOCK_EX)) {
		return false;
	}
	$now = time();
	$data = json_decode((string) stream_get_contents($handle), true);
	$hits = is_array($data) ? array_values(array_filter($data, static fn ($t) => is_int($t) && $t > $now - $window)) : [];
	$allowed = count($hits) < $max;
	if ($allowed) {
		$hits[] = $now;
	}
	ftruncate($handle, 0);
	rewind($handle);
	fwrite($handle, (string) json_encode($hits));
	fflush($handle);
	flock($handle, LOCK_UN);
	fclose($handle);
	@chmod($file, 0600);
	return $allowed;
}

/** Supprime les compteurs par IP inactifs depuis plus d'une fenêtre (minimisation des données). */
function purge_expired(string $dir, int $window): void
{
	foreach (glob($dir . '/ip-*.json') ?: [] as $file) {
		if (@filemtime($file) < time() - $window) {
			@unlink($file);
		}
	}
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
	header('Allow: POST', true, 405);
	exit;
}

$config = require __DIR__ . '/config.php';

// La requête doit venir du site lui-même (protection CSRF).
$host = strtolower((string) preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
$source = (string) ($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '');
if ($host === '' || $source === '' || strtolower((string) parse_url($source, PHP_URL_HOST)) !== $host) {
	redirect_to(REDIRECT_ERROR);
}

// Pot de miel rempli : on simule un succès pour ne pas renseigner le robot.
if (field('website') !== '') {
	redirect_to(REDIRECT_OK);
}

try {
	$dir = storage_dir($config);
	$ipWindow = (int) $config['rate_limit']['window'];
	purge_expired($dir, $ipWindow);
	$ipFile = $dir . '/ip-' . hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''), secret_key($dir)) . '.json';
	if (!hit_allowed($ipFile, (int) $config['rate_limit']['max'], $ipWindow)
		|| !hit_allowed($dir . '/global.json', (int) $config['daily_max'], 86400)) {
		redirect_to(REDIRECT_ERROR);
	}
} catch (Throwable $e) {
	error_log('Formulaire de contact : ' . $e->getMessage());
	redirect_to(REDIRECT_ERROR);
}

$options = json_decode((string) @file_get_contents(__DIR__ . '/contact-options.json'), true);
if (!is_array($options)) {
	redirect_to(REDIRECT_ERROR);
}

// --- Validation ---
$type = field('type');
$offer = '';
$name = single_line(field('nom'));
$email = single_line(field('email'));
$phone = single_line(field('telephone'));
// Message : retours à la ligne normalisés, autres caractères de contrôle supprimés.
$message = (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', str_replace(["\r\n", "\r"], "\n", field('message')));

$valid = is_string($type) && isset($options[$type])
	&& mb_strlen($name) >= 2 && mb_strlen($name) <= 100
	&& strlen($email) <= 190 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false
	&& ($phone === '' || preg_match('/^[0-9+().\s\-]{6,30}$/', $phone) === 1)
	&& mb_strlen($message) >= 10 && mb_strlen($message) <= 5000
	&& field('consentement') === 'oui';

if ($valid) {
	$offer = field('offre_' . $type);
	$valid = $offer === '' || isset($options[$type]['offers'][$offer]);
}

if (!$valid) {
	redirect_to(REDIRECT_ERROR);
}

// --- Envoi ---
$typeLabel = (string) $options[$type]['label'];
$offerLabel = $offer !== '' ? (string) $options[$type]['offers'][$offer] : 'Non précisée';

$subject = 'Nouvelle demande : ' . $typeLabel . ($offer !== '' ? ' - ' . $offerLabel : '');
$body = implode("\r\n", [
	'Nouvelle demande reçue depuis le formulaire de contact.',
	'',
	'Type de projet : ' . $typeLabel,
	'Offre souhaitée : ' . $offerLabel,
	'Nom : ' . $name,
	'E-mail : ' . $email,
	'Téléphone : ' . ($phone !== '' ? $phone : 'Non renseigné'),
	'',
	'Message :',
	str_replace("\n", "\r\n", $message),
	'',
	'--',
	'Envoyé le ' . date('d/m/Y à H:i') . '. Répondez directement à cet e-mail pour contacter le prospect.',
]);

$from = (string) $config['from'];
$headers = implode("\r\n", [
	'From: Site Z&L ScaleTech <' . $from . '>',
	'Reply-To: ' . $email,
	'MIME-Version: 1.0',
	'Content-Type: text/plain; charset=UTF-8',
	// Quoted-printable : lignes toujours conformes (≤ 76 caractères), quel que soit le message.
	'Content-Transfer-Encoding: quoted-printable',
]);

$sent = filter_var($from, FILTER_VALIDATE_EMAIL) !== false && mail(
	(string) $config['to'],
	'=?UTF-8?B?' . base64_encode($subject) . '?=',
	quoted_printable_encode($body),
	$headers,
	'-f' . $from
);

redirect_to($sent ? REDIRECT_OK : REDIRECT_ERROR);

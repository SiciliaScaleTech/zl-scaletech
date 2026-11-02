import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const input = 'Design/LogoScaletechtest.png';
const outputDirectory = 'public/assets/brand';

const circularMask = (size) => Buffer.from(
	`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" /></svg>`,
);

const sourceImage = (size) => sharp(input)
	.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
	.composite([{ input: circularMask(size), blend: 'dest-in' }]);

const exportLogo = async (size, suffix) => {
	await sourceImage(size)
		.png({ compressionLevel: 9, adaptiveFiltering: true })
		.toFile(`${outputDirectory}/logo-medallion${suffix}.png`);
	await sourceImage(size)
		.webp({ quality: 90, alphaQuality: 100, effort: 6 })
		.toFile(`${outputDirectory}/logo-medallion${suffix}.webp`);
};

await Promise.all([
	exportLogo(512, ''),
	exportLogo(1024, '@2x'),
	// Petites versions pour l'en-tête et le pied de page (affichées en 52 px).
	exportLogo(64, '-sm'),
	exportLogo(128, '-sm@2x'),
	sourceImage(128).png({ compressionLevel: 9 }).toFile(`${outputDirectory}/favicon.png`),
	// Icône déclarée pour Google : taille multiple de 48 px.
	sourceImage(192).png({ compressionLevel: 9 }).toFile(`${outputDirectory}/icon-192.png`),
	// Icône d'écran d'accueil iOS : fond plein (iOS remplace la transparence par du noir).
	sourceImage(180).flatten({ background: '#fdfbf7' }).png({ compressionLevel: 9 }).toFile('public/apple-touch-icon.png'),
]);

// favicon.ico à la racine : conteneur ICO avec des images PNG 16, 32 et 48 px.
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((size) => sourceImage(size).png({ compressionLevel: 9 }).toBuffer()));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0); // réservé
header.writeUInt16LE(1, 2); // type : icône
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
	const entry = 6 + 16 * i;
	header.writeUInt8(icoSizes[i], entry); // largeur
	header.writeUInt8(icoSizes[i], entry + 1); // hauteur
	header.writeUInt16LE(1, entry + 4); // plans
	header.writeUInt16LE(32, entry + 6); // bits par pixel
	header.writeUInt32LE(png.length, entry + 8);
	header.writeUInt32LE(offset, entry + 12);
	offset += png.length;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...pngs]));

console.log('Logo medallions generated from the original PNG.');
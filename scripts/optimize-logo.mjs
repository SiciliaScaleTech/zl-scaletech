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
	sourceImage(128).png({ compressionLevel: 9 }).toFile(`${outputDirectory}/favicon.png`),
]);

console.log('Logo medallions generated from the original PNG.');
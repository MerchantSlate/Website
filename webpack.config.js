// data
const
	mode = `production`, // `development` | `production` 

	// variable data
	websiteTitle = `instant payments for merchants`,
	websiteDescription = `MerchantSlate instant payments for merchants with a built-in complete database`,
	coverImage = `merchant_slate_cover.webp`,

	// pages 
	pagesList = [`about`],

	// permanent data
	websiteName = `MerchantSlate`,
	websiteDomain = `merchantslate.com`,
	developDir = `build`,
	productionDir = `public_html`,
	publishedTime = `2025-01-03T18:19:05+01:00`,

	// imports
	path = require('path'),
	webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	{ CleanWebpackPlugin } = require('clean-webpack-plugin'),
	WebpackObfuscator = require('webpack-obfuscator'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	SitemapPlugin = require('sitemap-webpack-plugin').default,
	dotenv = require('dotenv'),
	CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
	HtmlInlineCssWebpackPlugin = require('html-inline-css-webpack-plugin').default,
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	TerserPlugin = require('terser-webpack-plugin'),
	fs = require('fs'),

	// setup
	dataString = new Date().toISOString(),
	websiteLink = `https://${websiteDomain}`,
	coverImageLink = `${websiteLink}/assets/images/${coverImage}`,
	meta = {
		author: `${websiteName} Team`,
		image: coverImageLink,
		robots: `index, follow`,
		description: `${websiteDescription}`,
		viewport: `width=device-width, initial-scale=1.0`,
		charset: { charset: `UTF-8` },
		'http-equiv': {
			'http-equiv': `X-UA-Compatible`,
			content: `ie=edge`,
		},
		'twitter:card': `summary_large_image`,
		'twitter:title': {
			property: 'twitter:title',
			content: `${websiteName} | ${websiteTitle}`
		},
		'twitter:description': {
			property: 'twitter:description',
			content: `${websiteDescription}`
		},
		'twitter:image': {
			property: 'twitter:image',
			content: coverImageLink
		},
		'twitter:image:alt': {
			property: 'twitter:image:alt',
			content: `Screenshot of ${websiteName}\' ${websiteTitle}`
		},
		thumbnailUrl: {
			itemprop: `thumbnailUrl`,
			content: coverImageLink
		},
		image: {
			itemprop: `image`,
			content: coverImageLink
		},
		'article:published_time': {
			property: 'article:published_time',
			content: publishedTime
		},
		'article:modified_time': {
			property: 'article:modified_time',
			content: dataString
		},
		'og:type': {
			property: 'og:type',
			content: `website`,
			name: `type`,
		},
		'og:title': {
			property: 'og:title',
			content: `${websiteName} | ${websiteTitle}`,
			name: `title`,
		},
		'og:description': {
			property: 'og:description',
			content: `${websiteDescription}`,
			name: `description`,
		},
		'og:image': {
			property: 'og:image',
			content: coverImageLink,
			name: `image`,
		},
		'og:publish_date': {
			content: publishedTime,
			property: `og:publish_date`,
			name: `publish_date`,
		},
		'og:modified_date': {
			content: dataString,
			property: `og:modified_date`,
			name: `modified_date`,
		},
		'og:url': {
			content: websiteLink,
			property: `og:url`,
			name: `url`,
		},
	},
	canonical = page => `<link rel="canonical" href="https://merchantslate.com${page}">`,
	read = file => fs.readFileSync(path.resolve(__dirname, file), 'utf8'),
	headerHTML = read(`./src/common/header.html`),
	menuHTML = read(`./src/common/menu.html`),
	footerHTML = read(`./src/common/footer.html`),

	// Environment keys
	envKeys = {};
dotenv.config();
for (const key in process.env)
	envKeys[`process.env.${key}`] = JSON.stringify(process.env[key]);

// entry points
const entryPoints = {
	home: './src/pages/home/home.ts', // Entry file for TypeScript
};
for (let i = 0; i < pagesList.length; i++) {
	const fileName = pagesList[i];
	entryPoints[fileName] =
		`./src/pages/${fileName}/${fileName}.ts`;
};

module.exports = {
	entry: entryPoints,
	performance: {
		maxAssetSize: 2 * 1024 ** 2,
		maxEntrypointSize: 2 * 1024 ** 2,
	},
	output: {
		path: path.resolve(__dirname, productionDir),
		filename: `[name].[contenthash].js`,
	},
	resolve: {
		extensions: ['.ts', '.js'], // Resolve .ts and .js files
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: 'ts-loader',
		}, {
			test: /\.css$/, // For CSS files
			exclude: /node_modules/,
			use: [
				MiniCssExtractPlugin.loader, // Extract CSS into files
				'css-loader', // Process CSS files
			],
		}, {
			test: /\.(png|jpe?g|gif|svg|ico)$/, // For images
			exclude: /node_modules/,
			type: 'asset/resource',
			include: path.resolve(__dirname, 'src/assets/images'), // Only include files from the assets folder
			generator: {
				filename: 'assets/images/[name][ext][query]', // Output to dist/assets folder
			},
		}],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: `styles.css`, // Output CSS file with original name
		}),
		new webpack.DefinePlugin(envKeys),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [
				path.resolve(__dirname, productionDir, '*.js'), // Clear only .js files in the output directory
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/assets', to: 'assets' },
				{ from: 'src/settings', to: '.' },
			],
		}),
		new HtmlWebpackPlugin({
			chunks: [`home`],
			title: `${websiteName} | ${websiteTitle}`,
			links: canonical(``),
			template: './src/pages/home/home.html',
			meta,
			headerHTML,
			menuHTML,
			footerHTML,
		}),
		...pagesList.map(filename => {
			return new HtmlWebpackPlugin({
				chunks: [filename],
				title: `${filename?.toUpperCase()} | ${websiteName}`,
				links: canonical(`/${filename}`),
				template: `./src/pages/${filename}/${filename}.html`,
				filename,
				meta,
				headerHTML,
				menuHTML,
				footerHTML,
			})
		}),
		// new WebpackObfuscator(
		// 	{
		// 		rotateStringArray: true,
		// 		stringArray: true,
		// 		stringArrayThreshold: 0.8, // Percentage of strings to obfuscate
		// 	},
		// ),
		new SitemapPlugin({
			base: websiteLink, // Replace with your site's base URL
			paths: [
				{ path: '/', priority: 1.0, lastmod: dataString },
				...pagesList.map(filename => {
					return { path: `/${filename}`, priority: 0.8, lastmod: dataString }
				})
			],
			options: {
				filename: 'sitemap.xml', // The name of the generated sitemap
			},
		}),
		new HtmlInlineCssWebpackPlugin(), // Inline CSS into the HTML
	],
	optimization: {
		minimize: true, // Enable minimization
		minimizer: [
			new TerserPlugin({ // Minify JavaScript
				terserOptions: {
					compress: {
						drop_console: false, // Do not remove console logs
					},
				},
			}),
			new CssMinimizerPlugin(), // Add the CSS minimizer plugin
		],
	},
	devServer: {
		static: {
			directory: path.join(__dirname, developDir),
		},
		port: 3000, // Specify your desired port
		open: true, // Automatically open the browser
		compress: true, // Enable gzip compression for files served
	},
	mode
};
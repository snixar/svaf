export const siteConfig = {
	name: 'SVAF',
	siteName: 'snixar blog',
	title: 'snixar blog',
	subtitle: 'snixar',
	url: 'https://blog.snixar.com',
	icon: '',
	description: '',
	keywords: ['snixar blog','snixar','博客','Blog','blog'],
	lang: 'zh_CN',
	ogImage: '',
	author: {
		name: 'snixar',
		url: 'https://blog.snixar.com'
	},
	bio: {
		avatar: '',
		name: '',
		bio: '',
		links: []
	},
	live: {
		statusApi: '',
		roomUrl: ''
	},
	services: {},
	analytics: {},
	giscus: {
		repo: '',
		repoId: '',
		category: '',
		categoryId: ''
	},
	repos: {
		frontend: '',
		backend: '',
		natTool: ''
	},
	forum: {
		totpIssuer: 'AcoFork Forum'
	},
	links: {
		github: ''
	},
	navLinks: [
		{ label: '博客', icon: 'mdi:post-outline', href: '/posts' }
	] as const
};

export type SiteConfig = typeof siteConfig;

export interface UmamiConfig {
	src: string;
	websiteId: string;
}

export interface AnalyticsConfig {
	umami?: UmamiConfig;
	cfWebAnalytics?: { token: string };
	cfUmami?: { src: string };
	baidu?: { id: string };
	google?: { measurementId: string };
	clarity?: { projectId: string };
}

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
	analytics: {
		umami: {
			src: import.meta.env.PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js',
			websiteId: import.meta.env.PUBLIC_UMAMI_WEBSITE_ID || '',
		},
	} satisfies AnalyticsConfig,
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

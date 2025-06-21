import { useState, useEffect } from "react";

interface DashboardMetrics {
	// === MÉTRIQUES UTILISATEURS ===
	totalUsers: number; // Utilisateurs système
	totalParticipants: number; // Nombre de participants
	nbreParticipantEnligne: number; // Participants en ligne
	nbreParticipantPresentiel: number; // Participants en présentiel
	usersByRole: Array<{ role: string; count: number }>;
	newUsersThisMonth: number;
	userGrowth: number;
	userGrowthRate: string;
	activeUsers7d: number;
	activeUsers30d: number;
	usersBySpecialty: Array<{ specialty: string; count: number }>;

	// === MÉTRIQUES D'ENGAGEMENT ===
	avgSessionTime: string;
	avgPagesPerSession: number;
	bounceRate: string;
	engagementRate: string;
	avgLoginFrequency: number;

	// === MÉTRIQUES DE CONTENU ===
	topVideos: Array<{
		videoId: string;
		auteur: string;
		views: number;
		avgProgress: number;
		avgDuration: number;
	}>;
	topContent: Array<{
		contentType: string;
		contentId: string;
		interactions: number;
	}>;
	popularSearches: Array<{ query: string; count: number }>;
	avgVideoCompletion: string;
	participationMode: Array<{ mode: string; count: number }>;

	// === MÉTRIQUES D'ACTIVITÉ ===
	totalPageViews: number;
	totalVideoViews: number;
	totalSearches: number;
	totalContentInteractions: number;
	gdprConsentRate: string;

	// === ACTIVITÉS RÉCENTES ===
	recentActivities: Array<{
		id: number;
		type: string;
		description: string;
		timestamp: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
			role: string;
		};
	}>;
}

interface RecentActivity {
	type: string;
	description: string;
	timestamp: Date;
	user: { firstName: string; lastName: string };
	details?: any;
}

interface TemporalData {
	registrations: Array<{ date: string; count: number }>;
	logins: Array<{ date: string; count: number }>;
	pageViews: Array<{ date: string; count: number }>;
	videoViews: Array<{ date: string; count: number }>;
}

interface GeoData {
	country: string;
	users: number;
}

interface DashboardData {
	metrics: DashboardMetrics;
	recentActivities: RecentActivity[];
	temporalData: TemporalData;
	geoData: GeoData[];
}

export const useDashboardData = () => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Données de test temporaires
	const mockDashboardData: DashboardData = {
		metrics: {
			// === MÉTRIQUES UTILISATEURS ===
			totalUsers: 1250, // Utilisateurs système
			totalParticipants: 980, // Nombre de participants
			nbreParticipantEnligne: 500, // Participants en ligne
			nbreParticipantPresentiel: 480, // Participants en présentiel
			usersByRole: [
				{ role: "USER", count: 1200 },
				{ role: "ADMIN", count: 50 },
			],
			newUsersThisMonth: 45,
			userGrowth: 15,
			userGrowthRate: "+15.2%",
			activeUsers7d: 890,
			activeUsers30d: 1100,
			usersBySpecialty: [
				{ specialty: "Oncologie", count: 450 },
				{ specialty: "Radiologie", count: 320 },
				{ specialty: "Chirurgie", count: 280 },
				{ specialty: "Autres", count: 200 },
			],

			// === MÉTRIQUES D'ENGAGEMENT ===
			avgSessionTime: "12m 30s",
			avgPagesPerSession: 8.5,
			bounceRate: "25%",
			engagementRate: "78%",
			avgLoginFrequency: 3.2,

			// === MÉTRIQUES DE CONTENU ===
			topVideos: [
				{
					videoId: "1",
					auteur: "Dr. Martin",
					views: 1250,
					avgProgress: 85,
					avgDuration: 1800,
				},
				{
					videoId: "2",
					auteur: "Dr. Dubois",
					views: 980,
					avgProgress: 72,
					avgDuration: 1200,
				},
				{
					videoId: "3",
					auteur: "Dr. Leroy",
					views: 850,
					avgProgress: 90,
					avgDuration: 2400,
				},
			],
			topContent: [
				{ contentType: "Article", contentId: "1", interactions: 450 },
				{ contentType: "Vidéo", contentId: "2", interactions: 380 },
				{ contentType: "PDF", contentId: "3", interactions: 290 },
			],
			popularSearches: [
				{ query: "traitement cancer", count: 125 },
				{ query: "chimiothérapie", count: 98 },
				{ query: "radiothérapie", count: 87 },
				{ query: "immunothérapie", count: 76 },
			],
			avgVideoCompletion: "75%",
			participationMode: [
				{ mode: "Vidéo", count: 650 },
				{ mode: "Article", count: 420 },
				{ mode: "Quiz", count: 180 },
			],

			// === MÉTRIQUES D'ACTIVITÉ ===
			totalPageViews: 15420,
			totalVideoViews: 8900,
			totalSearches: 3200,
			totalContentInteractions: 5600,
			gdprConsentRate: "92%",

			// === ACTIVITÉS RÉCENTES ===
			recentActivities: [
				{
					id: 156,
					type: "USER_REGISTRATION",
					description: "Nouvelle inscription: Dr. Marie Dupont",
					timestamp: "2024-06-18T14:30:25.123Z",
					user: {
						firstName: "Marie",
						lastName: "Dupont",
						email: "marie.dupont@hopital.fr",
						role: "USER",
					},
				},
				{
					id: 155,
					type: "VIDEO_WATCH",
					description: "A regardé la vidéo sur l'immunothérapie",
					timestamp: "2024-06-18T13:45:12.456Z",
					user: {
						firstName: "Jean",
						lastName: "Martin",
						email: "jean.martin@clinique.fr",
						role: "USER",
					},
				},
				{
					id: 154,
					type: "ARTICLE_READ",
					description: "A lu l'article sur la chimiothérapie",
					timestamp: "2024-06-18T12:20:33.789Z",
					user: {
						firstName: "Sophie",
						lastName: "Leroy",
						email: "sophie.leroy@centre.fr",
						role: "USER",
					},
				},
				{
					id: 153,
					type: "QUIZ_COMPLETED",
					description: "A complété le quiz sur l'oncologie",
					timestamp: "2024-06-18T11:15:45.012Z",
					user: {
						firstName: "Pierre",
						lastName: "Durand",
						email: "pierre.durand@hopital.fr",
						role: "USER",
					},
				},
				{
					id: 152,
					type: "SEARCH",
					description: "A recherché 'traitement cancer'",
					timestamp: "2024-06-18T10:30:18.345Z",
					user: {
						firstName: "Claire",
						lastName: "Moreau",
						email: "claire.moreau@clinique.fr",
						role: "USER",
					},
				},
			],
		},

		recentActivities: [
			{
				type: "video_watch",
				description: "A regardé la vidéo sur l'immunothérapie",
				timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
				user: { firstName: "Marie", lastName: "Dubois" },
			},
			{
				type: "article_read",
				description: "A lu l'article sur la chimiothérapie",
				timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1h ago
				user: { firstName: "Jean", lastName: "Martin" },
			},
			{
				type: "search",
				description: "A recherché 'traitement cancer'",
				timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1h30 ago
				user: { firstName: "Sophie", lastName: "Leroy" },
			},
			{
				type: "quiz_completed",
				description: "A complété le quiz sur l'oncologie",
				timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2h ago
				user: { firstName: "Pierre", lastName: "Durand" },
			},
			{
				type: "registration",
				description: "S'est inscrit au forum",
				timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3h ago
				user: { firstName: "Claire", lastName: "Moreau" },
			},
		],

		temporalData: {
			registrations: [
				{ date: "2024-01", count: 45 },
				{ date: "2024-02", count: 52 },
				{ date: "2024-03", count: 38 },
				{ date: "2024-04", count: 67 },
				{ date: "2024-05", count: 89 },
				{ date: "2024-06", count: 76 },
			],
			logins: [
				{ date: "2024-01", count: 1200 },
				{ date: "2024-02", count: 1350 },
				{ date: "2024-03", count: 1180 },
				{ date: "2024-04", count: 1420 },
				{ date: "2024-05", count: 1680 },
				{ date: "2024-06", count: 1540 },
			],
			pageViews: [
				{ date: "2024-01", count: 8500 },
				{ date: "2024-02", count: 9200 },
				{ date: "2024-03", count: 8800 },
				{ date: "2024-04", count: 11200 },
				{ date: "2024-05", count: 13800 },
				{ date: "2024-06", count: 12500 },
			],
			videoViews: [
				{ date: "2024-01", count: 4200 },
				{ date: "2024-02", count: 4800 },
				{ date: "2024-03", count: 4500 },
				{ date: "2024-04", count: 5800 },
				{ date: "2024-05", count: 7200 },
				{ date: "2024-06", count: 6800 },
			],
		},

		geoData: [
			{ country: "France", users: 450 },
			{ country: "Belgique", users: 320 },
			{ country: "Suisse", users: 280 },
			{ country: "Canada", users: 120 },
			{ country: "Luxembourg", users: 80 },
		],
	};

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/dashboard");

				if (!response.ok) {
					// En cas d'erreur, utiliser les données de test
					setData(mockDashboardData);
					return;
				}

				const dashboardData = await response.json();
				setData(dashboardData);
			} catch (err) {
				// En cas d'erreur réseau, utiliser les données de test
				setData(mockDashboardData);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	return { data, loading, error };
};

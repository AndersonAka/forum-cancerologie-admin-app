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

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await fetch("/api/dashboard");

				if (!response.ok) {
					const errorMessage = `Erreur ${response.status}: ${response.statusText}`;
					setError(errorMessage);
					setData(null);
					return;
				}

				const dashboardData = await response.json();
				setData(dashboardData);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des données";
				setError(errorMessage);
				setData(null);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	return { data, loading, error };
};

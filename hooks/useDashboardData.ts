import { useState, useEffect } from "react";

interface DashboardMetrics {
	totalUsers: number;
	avgSessionTime: string;
	pageViews: number;
	engagementRate: string;
}

interface ActivityData {
	date: string;
	visits: number;
}

interface GeoData {
	country: string;
	users: number;
}

interface DashboardData {
	metrics: DashboardMetrics;
	activityData: ActivityData[];
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
				const response = await fetch("/api/dashboard");

				if (!response.ok) {
					throw new Error("Erreur lors de la récupération des données");
				}

				const dashboardData = await response.json();
				setData(dashboardData);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Une erreur est survenue"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	return { data, loading, error };
};

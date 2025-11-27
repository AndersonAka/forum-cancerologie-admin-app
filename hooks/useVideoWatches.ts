import { useState, useEffect } from "react";
import { videoWatchesService, FormattedVideoWatch } from "@/services/videoWatches.service";
import type { MRT_PaginationState } from "mantine-react-table";

export const useVideoWatches = (pagination?: MRT_PaginationState) => {
	const [videoWatches, setVideoWatches] = useState<FormattedVideoWatch[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState<number>(0);

	useEffect(() => {
		const fetchVideoWatches = async () => {
			try {
				setLoading(true);
				setError(null);

				// Calculer skip et take à partir de la pagination
				const skip = pagination
					? pagination.pageIndex * pagination.pageSize
					: undefined;
				const take = pagination?.pageSize;

				const response = await videoWatchesService.getAllVideoWatches(skip, take);
				const formattedWatches = videoWatchesService.formatVideoWatches(
					response.data
				);
				setVideoWatches(formattedWatches);
				setTotalCount(response.pagination.total);
			} catch (err: any) {
				const errorMessage =
					err.response?.data?.message ||
					err.response?.data?.error ||
					"Erreur lors de la récupération des vidéos regardées";
				setError(errorMessage);
				console.error("Erreur:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchVideoWatches();
	}, [pagination?.pageIndex, pagination?.pageSize]);

	return { videoWatches, loading, error, totalCount };
};

/**
 * Hook pour récupérer toutes les vidéos regardées (sans pagination) pour les graphiques
 */
export const useAllVideoWatches = () => {
	const [allVideoWatches, setAllVideoWatches] = useState<FormattedVideoWatch[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAllVideoWatches = async () => {
			try {
				setLoading(true);
				setError(null);

				// Récupérer toutes les vidéos regardées sans pagination
				const response = await videoWatchesService.getAllVideoWatches();
				const formattedWatches = videoWatchesService.formatVideoWatches(
					response.data
				);
				setAllVideoWatches(formattedWatches);
			} catch (err: any) {
				const errorMessage =
					err.response?.data?.message ||
					err.response?.data?.error ||
					"Erreur lors de la récupération des vidéos regardées";
				setError(errorMessage);
				console.error("Erreur:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchAllVideoWatches();
	}, []);

	return { allVideoWatches, loading, error };
};


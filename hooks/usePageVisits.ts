import { useState, useEffect } from "react";
import { pageVisitsService, FormattedPageVisit } from "@/services/pageVisits.service";
import type { MRT_PaginationState } from "mantine-react-table";

export const usePageVisits = (pagination?: MRT_PaginationState) => {
	const [pageVisits, setPageVisits] = useState<FormattedPageVisit[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState<number>(0);

	useEffect(() => {
		const fetchPageVisits = async () => {
			try {
				setLoading(true);
				setError(null);

				// Calculer skip et take à partir de la pagination
				const skip = pagination
					? pagination.pageIndex * pagination.pageSize
					: undefined;
				const take = pagination?.pageSize;

				const response = await pageVisitsService.getAllPageVisits(skip, take);
				const formattedVisits = pageVisitsService.formatPageVisits(
					response.data
				);
				setPageVisits(formattedVisits);
				setTotalCount(response.pagination.total);
			} catch (err: any) {
				const errorMessage =
					err.response?.data?.message ||
					err.response?.data?.error ||
					"Erreur lors de la récupération des visites";
				setError(errorMessage);
				console.error("Erreur:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchPageVisits();
	}, [pagination?.pageIndex, pagination?.pageSize]);

	return { pageVisits, loading, error, totalCount };
};

/**
 * Hook pour récupérer toutes les visites (sans pagination) pour les graphiques
 */
export const useAllPageVisits = () => {
	const [allPageVisits, setAllPageVisits] = useState<FormattedPageVisit[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAllPageVisits = async () => {
			try {
				setLoading(true);
				setError(null);

				// Récupérer toutes les visites sans pagination
				const response = await pageVisitsService.getAllPageVisits();
				const formattedVisits = pageVisitsService.formatPageVisits(
					response.data
				);
				setAllPageVisits(formattedVisits);
			} catch (err: any) {
				const errorMessage =
					err.response?.data?.message ||
					err.response?.data?.error ||
					"Erreur lors de la récupération des visites";
				setError(errorMessage);
				console.error("Erreur:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchAllPageVisits();
	}, []);

	return { allPageVisits, loading, error };
};


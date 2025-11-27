import { apiService } from "./api.service";

export interface PageVisit {
	id: number;
	userId: number;
	pageUrl: string;
	timeSpent: number | null;
	createdAt: string;
	user: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
	};
}

export interface FormattedPageVisit {
	id: number;
	userId: number;
	userName: string; // "Prénom Nom"
	userEmail: string;
	pageUrl: string;
	timeSpent: number | null;
	timeSpentFormatted: string; // "2m 5s" ou "N/A"
	dateVisited: string; // Formatée en français
	createdAt: string; // Date ISO pour le tri
}

export interface PageVisitsResponse {
	data: PageVisit[];
	pagination: {
		total: number;
		skip: number;
		take: number;
		hasMore: boolean;
	};
}

class PageVisitsService {
	/**
	 * Récupère les visites de pages avec les informations utilisateur
	 * @param skip - Nombre d'éléments à ignorer (pour la pagination)
	 * @param take - Nombre d'éléments à récupérer (taille de la page)
	 */
	async getAllPageVisits(skip?: number, take?: number): Promise<PageVisitsResponse> {
		const params = new URLSearchParams();
		if (skip !== undefined) params.append("skip", skip.toString());
		if (take !== undefined) params.append("take", take.toString());

		const url = `/page-visits${params.toString() ? `?${params.toString()}` : ""}`;
		const response = await apiService.get<PageVisitsResponse | PageVisit[]>(url);

		// Si la réponse est déjà formatée avec pagination (nouvelle structure)
		if ("data" in response && "pagination" in response) {
			return response as PageVisitsResponse;
		}

		// Si c'est l'ancienne structure avec pageVisits
		if ("pageVisits" in response && "pagination" in response) {
			const oldResponse = response as { pageVisits: PageVisit[]; pagination: any };
			return {
				data: oldResponse.pageVisits,
				pagination: {
					total: oldResponse.pagination.totalCount || oldResponse.pagination.total || oldResponse.pageVisits.length,
					skip: skip || 0,
					take: take || oldResponse.pageVisits.length,
					hasMore: oldResponse.pagination.hasMore || false,
				},
			};
		}

		// Sinon, formater la réponse (fallback pour compatibilité avec tableau simple)
		const visits = response as PageVisit[];
		return {
			data: visits,
			pagination: {
				total: visits.length,
				skip: skip || 0,
				take: take || visits.length,
				hasMore: false,
			},
		};
	}

	/**
	 * Formate les données pour l'affichage
	 */
	formatPageVisits(visits: PageVisit[]): FormattedPageVisit[] {
		return visits.map((visit) => {
			const userName = `${visit.user.firstName} ${visit.user.lastName}`;

			// Formater le temps passé
			let timeSpentFormatted = "N/A";
			if (visit.timeSpent !== null) {
				const minutes = Math.floor(visit.timeSpent / 60);
				const seconds = visit.timeSpent % 60;
				timeSpentFormatted = `${minutes}m ${seconds}s`;
			}

			// Formater la date
			const date = new Date(visit.createdAt);
			const dateVisited = date.toLocaleString("fr-FR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});

			return {
				id: visit.id,
				userId: visit.userId,
				userName,
				userEmail: visit.user.email,
				pageUrl: visit.pageUrl,
				timeSpent: visit.timeSpent,
				timeSpentFormatted,
				dateVisited,
				createdAt: visit.createdAt,
			};
		});
	}
}

export const pageVisitsService = new PageVisitsService();


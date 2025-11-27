import { apiService } from "./api.service";

export interface VideoWatch {
	id: number;
	userId: number;
	videoId: string;
	startTime: string;
	endTime: string | null;
	duration: number | null;
	progress: number | null;
	completed: boolean;
	auteur: string;
	dateVisualisation: string;
	user: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
	};
}

export interface FormattedVideoWatch {
	id: number;
	userId: number;
	userName: string; // "Prénom Nom"
	userEmail: string;
	videoId: string;
	duration: number | null;
	durationFormatted: string; // "2m 25s" ou "N/A"
	progress: number | null;
	progressFormatted: string; // "100%" ou "30%" ou "N/A"
	completed: boolean;
	completedFormatted: string; // "✅ Complétée" ou "⏸️ En cours"
	auteur: string;
	dateVisualisation: string; // Formatée en français
	startTime: string; // Formatée en français
	dateVisualisationISO: string; // Date ISO pour le tri
}

export interface VideoWatchesResponse {
	data: VideoWatch[];
	pagination: {
		total: number;
		skip: number;
		take: number;
		hasMore: boolean;
	};
}

class VideoWatchesService {
	/**
	 * Récupère les vidéos regardées avec les informations utilisateur
	 * @param skip - Nombre d'éléments à ignorer (pour la pagination)
	 * @param take - Nombre d'éléments à récupérer (taille de la page)
	 */
	async getAllVideoWatches(skip?: number, take?: number): Promise<VideoWatchesResponse> {
		const params = new URLSearchParams();
		if (skip !== undefined) params.append("skip", skip.toString());
		if (take !== undefined) params.append("take", take.toString());

		const url = `/video-watches${params.toString() ? `?${params.toString()}` : ""}`;
		const response = await apiService.get<VideoWatchesResponse | VideoWatch[]>(url);

		// Si la réponse est déjà formatée avec pagination (nouvelle structure)
		if ("data" in response && "pagination" in response) {
			return response as VideoWatchesResponse;
		}

		// Si c'est l'ancienne structure avec videoWatches
		if ("videoWatches" in response && "pagination" in response) {
			const oldResponse = response as { videoWatches: VideoWatch[]; pagination: any };
			return {
				data: oldResponse.videoWatches,
				pagination: {
					total: oldResponse.pagination.totalCount || oldResponse.pagination.total || oldResponse.videoWatches.length,
					skip: skip || 0,
					take: take || oldResponse.videoWatches.length,
					hasMore: oldResponse.pagination.hasMore || false,
				},
			};
		}

		// Sinon, formater la réponse (fallback pour compatibilité avec tableau simple)
		const watches = response as VideoWatch[];
		return {
			data: watches,
			pagination: {
				total: watches.length,
				skip: skip || 0,
				take: take || watches.length,
				hasMore: false,
			},
		};
	}

	/**
	 * Formate les données pour l'affichage
	 */
	formatVideoWatches(watches: VideoWatch[]): FormattedVideoWatch[] {
		return watches.map((watch) => {
			const userName = `${watch.user.firstName} ${watch.user.lastName}`;

			// Formater la durée
			let durationFormatted = "N/A";
			if (watch.duration !== null) {
				const minutes = Math.floor(watch.duration / 60);
				const seconds = watch.duration % 60;
				durationFormatted = `${minutes}m ${seconds}s`;
			}

			// Formater la progression
			let progressFormatted = "N/A";
			if (watch.progress !== null) {
				progressFormatted = `${watch.progress}%`;
			}

			// Formater le statut de complétion
			const completedFormatted = watch.completed ? "✅ Complétée" : "⏸️ En cours";

			// Formater la date de visualisation
			const dateVis = new Date(watch.dateVisualisation);
			const dateVisualisation = dateVis.toLocaleString("fr-FR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});

			// Formater l'heure de début
			const start = new Date(watch.startTime);
			const startTime = start.toLocaleString("fr-FR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});

			return {
				id: watch.id,
				userId: watch.userId,
				userName,
				userEmail: watch.user.email,
				videoId: watch.videoId,
				duration: watch.duration,
				durationFormatted,
				progress: watch.progress,
				progressFormatted,
				completed: watch.completed,
				completedFormatted,
				auteur: watch.auteur,
				dateVisualisation,
				startTime,
				dateVisualisationISO: watch.dateVisualisation,
			};
		});
	}
}

export const videoWatchesService = new VideoWatchesService();


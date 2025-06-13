import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { authService } from "./auth.service";

// Utiliser l'API route Next.js comme proxy
const API_URL = "/api";

class ApiService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: API_URL,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});

		// Intercepteur pour ajouter le token à chaque requête
		this.api.interceptors.request.use(
			(config) => {
				const token = authService.getToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Intercepteur pour gérer les erreurs
		this.api.interceptors.response.use(
			(response) => response,
			async (error) => {
				if (error.response?.status === 401) {
					// Token expiré ou invalide
					authService.logout();
					window.location.href = "/login";
				}

				// Gestion spécifique des erreurs CORS
				if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
					console.error(
						"Erreur de connexion à l'API. Vérifiez votre connexion internet."
					);
				}
				return Promise.reject(error);
			}
		);
	}

	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.api.get(url, config);
			return response.data;
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}

	async post<T>(
		url: string,
		data?: Record<string, unknown>,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.api.post(url, data, config);
			return response.data;
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}

	async put<T>(
		url: string,
		data?: Record<string, unknown>,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.api.put(url, data, config);
			return response.data;
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}

	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.api.delete(url, config);
			return response.data;
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}

	private handleError(error: unknown): void {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				// Le serveur a répondu avec un code d'état d'erreur
				console.error("Erreur API:", error.response.data);
			} else if (error.request) {
				// La requête a été faite mais aucune réponse n'a été reçue
				console.error("Pas de réponse du serveur:", error.request);
			} else {
				// Une erreur s'est produite lors de la configuration de la requête
				console.error("Erreur de configuration:", error.message);
			}
		} else {
			console.error("Erreur inattendue:", error);
		}
	}
}

export const apiService = new ApiService();

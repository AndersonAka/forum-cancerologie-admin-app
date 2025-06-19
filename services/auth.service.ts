import { apiService } from "./api.service";

export interface LoginCredentials {
	email: string;
	password: string;
	[key: string]: string;
}

export interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	title: string;
	participationMode: string;
	[key: string]: string;
}

export interface AuthResponse {
	access_token?: string;
	token?: string;
	user: {
		id: number;
		email: string;
		firstName: string;
		lastName: string;
		title: string;
		specialty: string;
		country: string;
		workplace: string;
		phoneNumber: string;
		participationMode: string;
		gdprConsent: boolean;
		rememberMeToken: string | null;
		createdAt: string;
		updatedAt: string;
		role: string;
	};
	message?: string;
}

class AuthService {
	private readonly TOKEN_KEY = "auth_token";
	private readonly USER_KEY = "auth_user";

	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		try {
			console.log("Tentative de connexion avec:", credentials.email);
			const response = await apiService.post<AuthResponse>(
				"/auth/login",
				credentials
			);
			console.log("Réponse du serveur:", response);

			const token = response.access_token || response.token;
			if (token) {
				console.log("Token reçu, stockage en cours...");
				this.setToken(token);
			}

			if (response.user) {
				console.log("Utilisateur reçu, stockage en cours...");
				this.setUser(response.user);
			}

			return response;
		} catch (error) {
			console.error("Erreur de connexion:", error);
			throw error;
		}
	}

	async register(data: RegisterData): Promise<AuthResponse> {
		try {
			const response = await apiService.post<AuthResponse["user"]>(
				"/register",
				data
			);
			console.log("Réponse du backend lors de l'inscription:", response);

			return {
				user: response,
				message:
					"Inscription réussie ! Vous allez être redirigé vers la page de connexion.",
			};
		} catch (error) {
			console.error("Erreur d'inscription:", error);
			throw error;
		}
	}

	async getCurrentUser(): Promise<AuthResponse["user"]> {
		try {
			const response = await apiService.get<AuthResponse>("/auth/me");
			return response.user;
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des informations utilisateur:",
				error
			);
			throw error;
		}
	}

	logout() {
		console.log("Déconnexion en cours...");
		document.cookie = `${this.TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		localStorage.removeItem(this.USER_KEY);
	}

	getToken(): string | null {
		if (typeof window !== "undefined") {
			const cookies = document.cookie.split(";");
			const tokenCookie = cookies.find((cookie) =>
				cookie.trim().startsWith(`${this.TOKEN_KEY}=`)
			);
			const token = tokenCookie ? tokenCookie.split("=")[1] : null;
			console.log("Token récupéré:", token ? "présent" : "absent");
			return token;
		}
		return null;
	}

	getUser(): AuthResponse["user"] | null {
		if (typeof window !== "undefined") {
			const userStr = localStorage.getItem(this.USER_KEY);
			const user = userStr ? JSON.parse(userStr) : null;
			console.log("Utilisateur récupéré:", user ? "présent" : "absent");
			return user;
		}
		return null;
	}

	isAuthenticated(): boolean {
		const isAuth = !!this.getToken() || !!this.getUser();
		console.log("État d'authentification:", isAuth);
		return isAuth;
	}

	setToken(token: string) {
		console.log("Stockage du token...");
		const expires = new Date();
		expires.setDate(expires.getDate() + 7); // Expire dans 7 jours
		document.cookie = `${
			this.TOKEN_KEY
		}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${
			process.env.NODE_ENV === "production" ? "; Secure" : ""
		}`;
	}

	setUser(user: AuthResponse["user"]) {
		console.log("Stockage de l'utilisateur...");
		localStorage.setItem(this.USER_KEY, JSON.stringify(user));
	}
}

export const authService = new AuthService();

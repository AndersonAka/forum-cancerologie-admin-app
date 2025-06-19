'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, LoginCredentials, RegisterData, AuthResponse } from 'services/auth.service';

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: AuthResponse['user'] | null;
	login: (credentials: LoginCredentials) => Promise<AuthResponse>;
	register: (data: RegisterData) => Promise<AuthResponse>;
	logout: () => void;
	error: string | null;
	role: string | null;
	isSpAdmin: boolean;
	isAdmin: boolean;
	isManager: boolean;
	isParticipant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<AuthResponse['user'] | null>(null);
	const [error, setError] = useState<string | null>(null);

	const role = user?.role || null;
	const isSpAdmin = role === "SPADMIN";
	const isAdmin = role === "ADMIN";
	const isManager = role === "MANAGER";
	const isParticipant = role === "USER";

	useEffect(() => {
		const initializeAuth = async () => {
			console.log("Initialisation de l'authentification...");
			try {
				const storedUser = authService.getUser();
				if (storedUser) {
					console.log("Utilisateur trouvé dans le stockage");
					setUser(storedUser);
					setIsAuthenticated(true);
				} else {
					console.log("Aucun utilisateur trouvé, vérification du token...");
					const token = authService.getToken();
					if (token) {
						try {
							console.log("Token trouvé, récupération des informations utilisateur...");
							const user = await authService.getCurrentUser();
							setUser(user);
							setIsAuthenticated(true);
						} catch (error) {
							console.error("Erreur lors de la récupération des informations utilisateur:", error);
							authService.logout();
						}
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		initializeAuth();
	}, []);

	// Auto-déconnexion après 30 min d'inactivité
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

		const resetTimer = () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (isAuthenticated) {
				timeoutId = setTimeout(() => {
					logout();
					if (typeof window !== 'undefined') {
						alert('Vous avez été déconnecté pour cause d\'inactivité.');
					}
				}, INACTIVITY_LIMIT);
			}
		};

		const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
		activityEvents.forEach(event => {
			window.addEventListener(event, resetTimer);
		});

		resetTimer(); // Démarre le timer au montage

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			activityEvents.forEach(event => {
				window.removeEventListener(event, resetTimer);
			});
		};
	}, [isAuthenticated]);

	const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
		try {
			console.log("Tentative de connexion dans le contexte...");
			setError(null);
			const response = await authService.login(credentials);
			console.log("Réponse de connexion reçue:", response);

			const token = response.access_token || response.token;
			if (token) {
				console.log("Stockage du token...");
				authService.setToken(token);
			}

			if (response.user) {
				console.log("Stockage de l'utilisateur...");
				authService.setUser(response.user);
				setUser(response.user);
				setIsAuthenticated(true);
			}

			return response;
		} catch (err) {
			console.error("Erreur de connexion dans le contexte:", err);
			setError(err instanceof Error ? err.message : 'Une erreur est survenue');
			throw err;
		}
	};

	const register = async (data: RegisterData) => {
		try {
			setError(null);
			const response = await authService.register(data);
			return response;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Une erreur est survenue');
			throw err;
		}
	};

	const logout = () => {
		console.log("Déconnexion dans le contexte...");
		authService.logout();
		setUser(null);
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				isLoading,
				user,
				login,
				register,
				logout,
				error,
				role,
				isSpAdmin,
				isAdmin,
				isManager,
				isParticipant,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
	}
	return context;
}

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
		const initAuth = async () => {
			const user = authService.getUser();
			if (user) {
				setUser(user);
				setIsAuthenticated(true);
				setIsLoading(false);
			} else {
				const token = authService.getToken();
				if (token) {
					try {
						// Optionnel : vérifier la validité du token avec le backend
						setUser(null);
					} catch (error) {
						authService.logout();
					}
				}
				setIsLoading(false);
			}
		};

		initAuth();
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
			setIsLoading(true);
			const response = await authService.login(credentials);
			const token = response.access_token || response.token;
			if (token) {
				authService.setToken(token);
			}

			if (response.user) {
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
		throw new Error(
			"useAuth doit être utilisé à l'intérieur d'un AuthProvider"
		);
	}
	return context;
}

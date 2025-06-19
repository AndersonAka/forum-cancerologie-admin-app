'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingOverlay, Stack, Text } from '@mantine/core';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
	redirectTo?: string;
}

export default function ProtectedRoute({
	children,
	requiredRoles = [],
	redirectTo = '/login'
}: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, user, logout } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Attendre que l'authentification soit initialisée
		if (isLoading) {
			return;
		}

		// Si non authentifié, rediriger vers la page de connexion
		if (!isAuthenticated) {
			logout();
			router.push(redirectTo);
			return;
		}

		// Si des rôles sont requis, vérifier les permissions
		if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
			router.push('/dashboard');
			return;
		}
	}, [isAuthenticated, isLoading, user, requiredRoles, redirectTo, logout, router]);

	// Afficher un loader pendant l'initialisation de l'authentification
	if (isLoading) {
		return (
			<Stack gap="md" align="center" justify="center" style={{ minHeight: '200px' }}>
				<Text size="lg" c="dimmed">Vérification de l'authentification...</Text>
			</Stack>
		);
	}

	// Si non authentifié ou permissions insuffisantes, ne rien afficher
	// (la redirection se fait dans le useEffect)
	if (!isAuthenticated || (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role))) {
		return null;
	}

	return <>{children}</>;
}

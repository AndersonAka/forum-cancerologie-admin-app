import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "contexts/AuthContext";
import { Center, Text } from "@mantine/core";

interface RoleProtectedRouteProps {
	allowedRoles: string[];
	children: ReactNode;
}

export default function RoleProtectedRoute({ allowedRoles, children }: RoleProtectedRouteProps) {
	const { isAuthenticated, role } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			router.replace("/login");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	if (!role || !allowedRoles.includes(role)) {
		return (
			<Center h="100vh">
				<Text color="red" size="xl" fw={700}>
					Accès refusé : vous n'avez pas les droits nécessaires pour accéder à cette page.
				</Text>
			</Center>
		);
	}

	return <>{children}</>;
}

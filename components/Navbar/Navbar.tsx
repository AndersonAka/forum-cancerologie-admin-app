"use client";

import { Button, Flex, ScrollArea, LoadingOverlay, Skeleton } from "@mantine/core";
import { useState } from "react";
import { UserButton } from "components/UserButton/UserButton";
import type { NavItem } from "types/nav-item";
import { NavLinksGroup } from "./NavLinksGroup";
import classes from "./Navbar.module.css";
import { useAuth } from "contexts/AuthContext";
import { useRouter } from "next/navigation";
import { UserProfile } from "../UserProfile/UserProfile";

interface Props {
	data: NavItem[];
	hidden?: boolean;
}

export function Navbar({ data }: Props) {
	const { user, role, logout } = useAuth();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const isLoading = !user || !role || isLoggingOut;

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			logout();
			router.push("/login");
		} catch (error) {
			console.error("Erreur lors de la déconnexion:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};


	// Filtrage des liens selon le rôle
	const filteredLinks = data.filter((item) => {
		if (!item.roles) return true; // Si pas de restriction, visible pour tous
		return role && item.roles.includes(role);
	});

	const links = filteredLinks.map((item) => (
		<NavLinksGroup key={item.label} {...item} />
	));

	return (
		<>
			<LoadingOverlay visible={isLoggingOut} overlayProps={{ blur: 2 }} />
			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>
					{isLoading ? (
						<>
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton mx={10} key={i} height={32} mt={i === 0 ? 0 : 12} radius="sm" />
							))}
						</>
					) : (
						links
					)}
				</div>
			</ScrollArea>
			{/* //TODO: Afficher le nom et l'email de l'utilisateur */}
			{isLoading ? (
				<div className={classes.footer}>
					<Skeleton height={40} width={180} radius="xl" mb={8} />
					<Flex justify="flex-start" ml={10} mb={20}>
						<Skeleton height={28} width={90} radius="sm" />
					</Flex>
				</div>
			) : user && (
				<Flex justify="center" ml={10} mb={20}>
					<UserProfile showDropdown={true} size="md" variant="default" color="black" />
				</Flex>
			)}
		</>
	);
}

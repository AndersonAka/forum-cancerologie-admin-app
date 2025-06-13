"use client";

import { Button, Flex, ScrollArea, LoadingOverlay } from "@mantine/core";
import { useState } from "react";
import { UserButton } from "components/UserButton/UserButton";
import type { NavItem } from "types/nav-item";
import { NavLinksGroup } from "./NavLinksGroup";
import classes from "./Navbar.module.css";
import { useAuth } from "contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Props {
	data: NavItem[];
	hidden?: boolean;
}

export function Navbar({ data }: Props) {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

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

	const links = data.map((item) => (
		<NavLinksGroup key={item.label} {...item} />
	));

	return (
		<>
			<LoadingOverlay visible={isLoggingOut} overlayProps={{ blur: 2 }} />
			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>
			{/* //TODO: Afficher le nom et l'email de l'utilisateur */}
			{user && (
				<div className={classes.footer}>
					<UserButton
						image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
						name={`${user.firstName} ${user.lastName}`}
						email={user.email}
					/>
					<Flex justify="flex-start" ml={50} mb={10}>
						<Button
							variant="outline"
							onClick={handleLogout}
							size="xs"
							color="red"
							loading={isLoggingOut}
						>
							Déconnexion
						</Button>
					</Flex>
				</div>
			)}
		</>
	);
}

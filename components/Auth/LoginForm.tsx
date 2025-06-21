"use client";

import {
	Button,
	Card,
	Checkbox,
	Group,
	PasswordInput,
	TextInput,
	Alert,
} from "@mantine/core";
import { useAuth } from "contexts/AuthContext";
import { useNotifications } from "contexts/NotificationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const { login } = useAuth();
	const { showSuccess, showError } = useNotifications();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");
		try {
			const response = await login({ email, password });
			if (response.user) {
				if (response.user.role === "USER") {
					const msg = "Vous n'avez pas accès à l'administration. Veuillez contacter un administrateur si besoin.";
					setErrorMessage(msg);
					showError(msg);
					return;
				}
				showSuccess("Connexion réussie");
				const from = searchParams.get("from") || "/dashboard";

				setTimeout(() => {
					window.location.href = from;
				}, 100);
			} else {
				setErrorMessage(response.message || "Erreur lors de la connexion");
				showError("Erreur lors de la connexion");
			}
		} catch (error: any) {
			let friendlyMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";

			if (error?.response) {
				// Erreur du backend
				if (error.response.data?.error) {
					// Message explicite du backend
					if (
						error.response.status === 400 ||
						error.response.status === 401 ||
						error.response.data?.error === "Unauthorized"
					) {
						friendlyMessage = "Email ou mot de passe incorrect. Veuillez réessayer.";
					} else {
						friendlyMessage = error.response.data.error;
					}
				} else if (error.response.data?.message) {
					friendlyMessage = error.response.data.message;
				}
			} else if (error?.message && error.message.includes("Network Error")) {
				friendlyMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
			}

			setErrorMessage(friendlyMessage);
			showError(friendlyMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card withBorder shadow="md" p={30} mt={30} radius="md">
				<TextInput
					label="Email"
					placeholder="test@example.com"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<PasswordInput
					label="Mot de passe"
					placeholder="Votre mot de passe"
					required
					mt="md"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<Group mt="md" justify="space-between">
					<Checkbox label="Se souvenir de moi" />
					{/* <Anchor size="sm" href="#">
					Mot de passe oublié ?
				</Anchor> */}
				</Group>
				{errorMessage && (
					<Alert color="red" mt={16} mb={8} title="Erreur" variant="light">
						{errorMessage}
					</Alert>
				)}
				<Button
					loading={isLoading}
					fullWidth
					mt="xl"
					type="submit"
				>
					Se connecter
				</Button>
			</Card>
		</form>
	);
}

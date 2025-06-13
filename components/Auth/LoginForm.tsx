"use client";

import {
	Button,
	Card,
	Checkbox,
	Group,
	PasswordInput,
	TextInput,
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
	const { login } = useAuth();
	const { showSuccess, showError } = useNotifications();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			console.log("Début de la tentative de connexion");
			const response = await login({ email, password });
			console.log("Réponse de connexion:", response);

			if (response.user) {
				showSuccess("Connexion réussie");
				const from = searchParams.get("from") || "/dashboard";
				console.log("Redirection vers:", from);

				// Utiliser window.location.href pour forcer la redirection
				setTimeout(() => {
					window.location.href = from;
				}, 100);
			} else {
				showError("Erreur lors de la connexion");
			}
		} catch (error) {
			console.error("Erreur de connexion:", error);
			showError("Email ou mot de passe incorrect");
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

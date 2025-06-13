"use client";

import { TextInput, PasswordInput, Select, Button, Stack, Paper, Title, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserFormValues {
	email: string;
	password?: string;
	firstName: string;
	lastName: string;
	title: string;
	specialty: string;
	country: string;
	workplace: string;
	phoneNumber: string;
	participationMode: "online" | "in_person";
	gdprConsent: boolean;
}

const titles = [
	{ value: "Dr", label: "Docteur" },
	{ value: "Pr", label: "Professeur" },
	{ value: "M.", label: "Monsieur" },
	{ value: "Mme", label: "Madame" },
];

const participationModes = [
	{ value: "online", label: "En ligne" },
	{ value: "in_person", label: "Présentiel" },
];

export default function EditUserPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const form = useForm<UserFormValues>({
		initialValues: {
			email: "",
			firstName: "",
			lastName: "",
			title: "",
			specialty: "",
			country: "",
			workplace: "",
			phoneNumber: "",
			participationMode: "online",
			gdprConsent: false,
		},
		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email invalide"),
			password: (value) => (value && value.length < 6 ? "Le mot de passe doit contenir au moins 6 caractères" : null),
			firstName: (value) => (value.length < 2 ? "Le prénom est requis" : null),
			lastName: (value) => (value.length < 2 ? "Le nom est requis" : null),
			title: (value) => (value.length < 1 ? "Le titre est requis" : null),
			specialty: (value) => (value.length < 2 ? "La spécialité est requise" : null),
			country: (value) => (value.length < 2 ? "Le pays est requis" : null),
			workplace: (value) => (value.length < 2 ? "Le lieu de travail est requis" : null),
			phoneNumber: (value) => (value.length < 5 ? "Le numéro de téléphone est requis" : null),
		},
	});

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`/api/users/${params.id}`);
				if (!response.ok) {
					throw new Error("Erreur lors du chargement de l'utilisateur");
				}
				const user = await response.json();
				form.setValues({
					...user,
					password: "", // On ne charge pas le mot de passe
				});
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors du chargement de l'utilisateur",
					color: "red",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [params.id]);

	const handleSubmit = async (values: UserFormValues) => {
		try {
			// On ne renvoie le mot de passe que s'il a été modifié
			const dataToSend = values.password
				? values
				: { ...values, password: undefined };

			const response = await fetch(`/api/users/${params.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dataToSend),
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la modification de l'utilisateur");
			}

			notifications.show({
				title: "Succès",
				message: "Utilisateur modifié avec succès",
				color: "green",
			});

			router.push("/dashboard/users");
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Erreur lors de la modification de l'utilisateur",
				color: "red",
			});
		}
	};

	if (loading) {
		return <div>Chargement...</div>;
	}

	return (
		<Paper withBorder radius="md" p="xl">
			<Title order={2} mb="xl">Modifier l'utilisateur</Title>

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					<Group grow>
						<Select
							label="Titre"
							placeholder="Sélectionnez un titre"
							data={titles}
							{...form.getInputProps("title")}
						/>
						<TextInput
							label="Prénom"
							placeholder="Prénom"
							{...form.getInputProps("firstName")}
						/>
						<TextInput
							label="Nom"
							placeholder="Nom"
							{...form.getInputProps("lastName")}
						/>
					</Group>

					<TextInput
						label="Email"
						placeholder="email@example.com"
						{...form.getInputProps("email")}
					/>

					<PasswordInput
						label="Mot de passe (laisser vide pour ne pas modifier)"
						placeholder="Nouveau mot de passe"
						{...form.getInputProps("password")}
					/>

					<TextInput
						label="Spécialité"
						placeholder="Spécialité"
						{...form.getInputProps("specialty")}
					/>

					<Group grow>
						<TextInput
							label="Pays"
							placeholder="Pays"
							{...form.getInputProps("country")}
						/>
						<TextInput
							label="Lieu de travail"
							placeholder="Lieu de travail"
							{...form.getInputProps("workplace")}
						/>
						<TextInput
							label="Numéro de téléphone"
							placeholder="Numéro de téléphone"
							{...form.getInputProps("phoneNumber")}
						/>
					</Group>

					<Select
						label="Mode de participation"
						placeholder="Sélectionnez un mode"
						data={participationModes}
						{...form.getInputProps("participationMode")}
					/>

					<Group justify="flex-end" mt="xl">
						<Button variant="light" onClick={() => router.back()}>
							Annuler
						</Button>
						<Button type="submit">
							Enregistrer les modifications
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}

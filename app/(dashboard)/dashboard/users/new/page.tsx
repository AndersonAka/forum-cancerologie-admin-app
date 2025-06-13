"use client";

import { TextInput, PasswordInput, Select, Button, Stack, Paper, Title, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { z } from "zod";

const userSchema = z.object({
	email: z.string().email("Email invalide"),
	password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
	firstName: z.string().min(2, "Le prénom est requis"),
	lastName: z.string().min(2, "Le nom est requis"),
	title: z.string().min(1, "Le titre est requis"),
	specialty: z.string().min(2, "La spécialité est requise"),
	country: z.string().min(2, "Le pays est requis"),
	workplace: z.string().min(2, "Le lieu de travail est requis"),
	phoneNumber: z.string().min(5, "Le numéro de téléphone est requis"),
	participationMode: z.enum(["online", "in_person"]),
	gdprConsent: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

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

export default function NewUserPage() {
	const router = useRouter();
	const form = useForm<UserFormValues>({
		initialValues: {
			email: "",
			password: "",
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
			email: (value) => {
				const result = userSchema.shape.email.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			password: (value) => {
				const result = userSchema.shape.password.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			firstName: (value) => {
				const result = userSchema.shape.firstName.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			lastName: (value) => {
				const result = userSchema.shape.lastName.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			title: (value) => {
				const result = userSchema.shape.title.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			specialty: (value) => {
				const result = userSchema.shape.specialty.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			country: (value) => {
				const result = userSchema.shape.country.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			workplace: (value) => {
				const result = userSchema.shape.workplace.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
			phoneNumber: (value) => {
				const result = userSchema.shape.phoneNumber.safeParse(value);
				return result.success ? null : result.error.errors[0].message;
			},
		},
	});

	const handleSubmit = async (values: UserFormValues) => {
		try {
			// Validation avec Zod avant l'envoi
			const validationResult = userSchema.safeParse(values);
			if (!validationResult.success) {
				throw new Error(validationResult.error.errors[0].message);
			}

			const response = await fetch("/api/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'utilisateur");
			}

			notifications.show({
				title: "Succès",
				message: "Utilisateur créé avec succès",
				color: "green",
			});

			router.push("/dashboard/users");
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: error instanceof Error ? error.message : "Erreur lors de la création de l'utilisateur",
				color: "red",
			});
		}
	};

	return (
		<Paper withBorder radius="md" p="xl">
			<Title order={2} mb="xl">Nouvel utilisateur</Title>

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
						label="Mot de passe"
						placeholder="Mot de passe"
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
							Créer l'utilisateur
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}

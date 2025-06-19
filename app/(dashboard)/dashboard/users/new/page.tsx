"use client";

import { TextInput, PasswordInput, Select, Button, Stack, Paper, Title, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { z } from "zod";

const userSchema = z.object({
	email: z.string().email("Email invalide"),
	password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
	nom: z.string().min(2, "Le nom est requis"),
	titre: z.string().min(1, "Le titre est requis"),
	telephone: z.string().min(5, "Le numéro de téléphone est requis"),
	pays: z.string().min(2, "Le pays est requis"),
	role: z.enum(["SPADMIN", "ADMIN", "MANAGER"]),
	specialite: z.string().min(2, "La spécialité est requise"),
});

type UserFormValues = z.infer<typeof userSchema>;

const roles = [
	{ value: "SPADMIN", label: "Super Admin" },
	{ value: "ADMIN", label: "Admin" },
	{ value: "MANAGER", label: "Manager" },
];

const titles = [

	{ value: "M.", label: "Monsieur" },
	{ value: "Mme", label: "Madame" },
];

export default function NewUserPage() {
	const router = useRouter();
	const form = useForm<UserFormValues>({
		initialValues: {
			email: "",
			password: "",
			nom: "",
			titre: "",
			telephone: "",
			pays: "",
			role: "ADMIN",
			specialite: "",
		},
		validate: {
			email: (value) => userSchema.shape.email.safeParse(value).success ? null : "Email invalide",
			password: (value) => userSchema.shape.password.safeParse(value).success ? null : "Le mot de passe doit contenir au moins 6 caractères",
			nom: (value) => userSchema.shape.nom.safeParse(value).success ? null : "Le nom est requis",
			titre: (value) => userSchema.shape.titre.safeParse(value).success ? null : "Le titre est requis",
			telephone: (value) => userSchema.shape.telephone.safeParse(value).success ? null : "Le numéro de téléphone est requis",
			pays: (value) => userSchema.shape.pays.safeParse(value).success ? null : "Le pays est requis",
			role: (value) => userSchema.shape.role.safeParse(value).success ? null : "Le rôle est requis",
			specialite: (value) => userSchema.shape.specialite.safeParse(value).success ? null : "La spécialité est requise",
		},
	});

	const handleSubmit = async (values: UserFormValues) => {
		try {
			const validationResult = userSchema.safeParse(values);
			if (!validationResult.success) {
				throw new Error(validationResult.error.errors[0].message);
			}

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la création de l'utilisateur système");
			}

			notifications.show({
				title: "Succès",
				message: "Utilisateur système créé avec succès",
				color: "green",
			});

			router.push("/dashboard/users");
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: error instanceof Error ? error.message : "Erreur lors de la création de l'utilisateur système",
				color: "red",
			});
		}
	};

	return (
		<Paper withBorder radius="md" p="xl">
			<Title order={2} mb="xl">Nouvel utilisateur système</Title>

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
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
						label="Nom complet"
						placeholder="Nom complet"
						{...form.getInputProps("nom")}
					/>
					<Select
						label="Titre"
						placeholder="Sélectionnez un titre"
						data={titles}
						{...form.getInputProps("titre")}
					/>
					<TextInput
						label="Téléphone"
						placeholder="Numéro de téléphone"
						{...form.getInputProps("telephone")}
					/>
					<TextInput
						label="Pays"
						placeholder="Pays"
						{...form.getInputProps("pays")}
					/>
					<Select
						label="Rôle"
						placeholder="Sélectionnez un rôle"
						data={roles}
						{...form.getInputProps("role")}
					/>
					<TextInput
						label="Spécialité"
						placeholder="Spécialité"
						{...form.getInputProps("specialite")}
					/>
					<Group justify="flex-end" mt="xl">
						<Button variant="light" onClick={() => router.back()}>
							Annuler
						</Button>
						<Button type="submit">
							Créer l'utilisateur système
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}

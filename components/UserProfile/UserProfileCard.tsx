"use client";

import { Card, Group, Text, Stack, Title, Box, Badge, Button, Avatar, Paper, Modal, TextInput, LoadingOverlay } from "@mantine/core";
import { IconUser, IconMail, IconPhone, IconIdBadge, IconBriefcase, IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

export const UserProfileCard: React.FC = () => {
	const { user, isLoading } = useAuth();
	const [editOpened, setEditOpened] = useState(false);
	const [loading, setLoading] = useState(false);

	const form = useForm({
		initialValues: {
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			title: user?.title || "",
			specialty: user?.specialty || "",
			phoneNumber: user?.phoneNumber || "",
		},
		validate: {
			firstName: (v: string) => !v ? "Le prénom est requis" : null,
			lastName: (v: string) => !v ? "Le nom est requis" : null,
		},
	});

	React.useEffect(() => {
		if (user) {
			form.setValues({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				title: user.title || "",
				specialty: user.specialty || "",
				phoneNumber: user.phoneNumber || "",
			});
		}
		// eslint-disable-next-line
	}, [user]);

	const handleEdit = () => setEditOpened(true);
	const handleClose = () => setEditOpened(false);

	const handleSubmit = async (values: typeof form.values) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/users/${user?.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(values),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || "Erreur lors de la mise à jour du profil");
			}
			notifications.show({
				title: "Profil mis à jour",
				message: "Vos informations ont été enregistrées avec succès.",
				color: "green",
				icon: <IconCheck size={16} />,
			});
			setEditOpened(false);
		} catch (err: any) {
			notifications.show({
				title: "Erreur",
				message: err.message || "Erreur inattendue",
				color: "red",
				icon: <IconX size={16} />,
			});
		} finally {
			setLoading(false);
		}
	};

	const roleLabel = {
		SPADMIN: "Super Administrateur",
		ADMIN: "Administrateur",
		MANAGER: "Manager",
		USER: "Participant"
	}[user?.role || ""] || user?.role;

	const roleColor = {
		SPADMIN: "grape",
		ADMIN: "blue",
		MANAGER: "teal",
		USER: "gray"
	}[user?.role || ""] || "gray";

	if (isLoading || !user) {
		return (
			<Box maw={520} mx="auto" mt={40}>
				<Card shadow="sm" radius="md" p="xl" withBorder>
					<LoadingOverlay visible={true} />
				</Card>
			</Box>
		);
	}

	return (
		<Box maw={520} mx="auto" mt={40}>
			{/* Header visuel avec avatar */}
			<Box style={{ display: 'flex', justifyContent: 'center' }}>
				<Avatar size={96} radius={48} color="blue" style={{ border: "4px solid white" }}>
					<IconUser size={48} />
				</Avatar>
			</Box>
			<Card shadow="sm" radius="md" p="xl" withBorder mt={16} style={{ background: "#f8fafc" }}>
				<Stack align="center" gap={4} mb={12}>
					<Title order={3} fw={700}>{user.firstName} {user.lastName}</Title>
					<Text size="sm" c="dimmed" mb={2}>
						<Group gap={4} align="center">
							<IconMail size={16} />
							{user.email}
						</Group>
					</Text>
					<Badge color={roleColor} size="md" radius="sm" variant="filled">{roleLabel}</Badge>
				</Stack>
				<Stack gap={16} mt={16}>
					{user.title && (
						<Group gap={8} align="center">
							<IconIdBadge size={18} color="#6366f1" />
							<Text size="md"><b>Titre :</b> {user.title}</Text>
						</Group>
					)}
					{user.specialty && (
						<Group gap={8} align="center">
							<IconBriefcase size={18} color="#14b8a6" />
							<Text size="md"><b>Spécialité :</b> {user.specialty}</Text>
						</Group>
					)}
					{user.phoneNumber && (
						<Group gap={8} align="center">
							<IconPhone size={18} color="#2563eb" />
							<Text size="md"><b>Téléphone :</b> {user.phoneNumber}</Text>
						</Group>
					)}
				</Stack>
				<Group justify="center" mt={32}>
					<Button leftSection={<IconEdit size={18} />} variant="light" color="blue" radius="md" onClick={handleEdit}>
						Modifier mon profil
					</Button>
				</Group>
			</Card>
			<Modal opened={editOpened} onClose={handleClose} title="Modifier mon profil" centered>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap="md">
						<TextInput label="Prénom" required {...form.getInputProps("firstName")} />
						<TextInput label="Nom" required {...form.getInputProps("lastName")} />
						<TextInput label="Titre" {...form.getInputProps("title")} />
						<TextInput label="Spécialité" {...form.getInputProps("specialty")} />
						<TextInput label="Téléphone" {...form.getInputProps("phoneNumber")} />
						<Group justify="flex-end" mt="md">
							<Button variant="default" onClick={handleClose} disabled={loading}>Annuler</Button>
							<Button type="submit" loading={loading} color="blue">Enregistrer</Button>
						</Group>
					</Stack>
				</form>
			</Modal>
		</Box>
	);
};

'use client';

import React, { useState, useEffect } from 'react';
import {
	Modal,
	TextInput,
	PasswordInput,
	Select,
	Button,
	Group,
	Stack,
	Text,
	Alert,
	LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { authService } from '@/services/auth.service';

interface UserFormData {
	email: string;
	password?: string;
	firstName: string;
	lastName: string;
	title?: string;
	specialty?: string;
	phoneNumber?: string;
	role: 'SPADMIN' | 'ADMIN' | 'MANAGER';
}

interface UserFormProps {
	opened: boolean;
	onClose: () => void;
	user?: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		title?: string;
		specialty?: string;
		phoneNumber?: string;
		role: 'SPADMIN' | 'ADMIN' | 'MANAGER';
	} | null;
	onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
	opened,
	onClose,
	user,
	onSuccess,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditing = !!user;

	const form = useForm<UserFormData>({
		initialValues: {
			email: '',
			password: '',
			firstName: '',
			lastName: '',
			title: '',
			specialty: '',
			phoneNumber: '',
			role: 'MANAGER',
		},
		validate: {
			email: (value) => {
				if (!value) return 'L\'email est requis';
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
					return 'Format d\'email invalide';
				}
				return null;
			},
			password: (value, values) => {
				if (!isEditing && !value) return 'Le mot de passe est requis';
				if (value && value.length < 6) {
					return 'Le mot de passe doit contenir au moins 6 caractères';
				}
				return null;
			},
			firstName: (value) => {
				if (!value) return 'Le prénom est requis';
				if (value.length < 2) return 'Le prénom doit contenir au moins 2 caractères';
				return null;
			},
			lastName: (value) => {
				if (!value) return 'Le nom est requis';
				if (value.length < 2) return 'Le nom doit contenir au moins 2 caractères';
				return null;
			},
			role: (value) => {
				if (!value) return 'Le rôle est requis';
				return null;
			},
		},
	});

	// Réinitialiser le formulaire quand la modal s'ouvre/ferme ou quand l'utilisateur change
	useEffect(() => {
		if (opened) {
			setError(null);
			if (user) {
				// Mode édition
				form.setValues({
					email: user.email,
					password: '', // Pas de mot de passe en édition
					firstName: user.firstName,
					lastName: user.lastName,
					title: user.title,
					specialty: user.specialty,
					phoneNumber: user.phoneNumber,
					role: user.role,
				});
			} else {
				// Mode création
				form.reset();
			}
		}
	}, [opened, user]);

	const handleSubmit = async (values: UserFormData) => {
		// Confirmation pour création
		if (!isEditing) {
			const confirmCreate = confirm(
				`Êtes-vous sûr de vouloir créer un nouvel utilisateur système ?\n\n` +
				`Email: ${values.email}\n` +
				`Nom: ${values.firstName} ${values.lastName}\n` +
				`Rôle: ${values.role}`
			);
			if (!confirmCreate) {
				return;
			}
		} else {
			// Confirmation pour modification
			const confirmEdit = confirm(
				`Êtes-vous sûr de vouloir modifier cet utilisateur système ?\n\n` +
				`Email: ${values.email}\n` +
				`Nom: ${values.firstName} ${values.lastName}\n` +
				`Rôle: ${values.role}\n\n` +
				`Cette action modifiera les informations de l'utilisateur.`
			);
			if (!confirmEdit) {
				return;
			}
		}

		setLoading(true);
		setError(null);

		try {
			const token = authService.getToken();
			if (!token) {
				throw new Error('Token d\'authentification manquant');
			}

			const url = isEditing
				? `/api/users/${user!.id}`
				: '/api/users';

			const method = isEditing ? 'PATCH' : 'POST';

			// Préparer les données à envoyer
			const requestData: any = {
				email: values.email,
				firstName: values.firstName,
				lastName: values.lastName,
				title: values.title,
				specialty: values.specialty,
				phoneNumber: values.phoneNumber,
				role: values.role,
			};

			// Ajouter le mot de passe seulement si fourni (création ou modification)
			if (values.password) {
				requestData.password = values.password;
			}

			console.log('Envoi des données:', {
				url,
				method,
				requestData,
				isEditing,
				userId: user?.id
			});

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(requestData),
			});

			console.log('Réponse brute:', {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
				ok: response.ok
			});

			// Essayer de lire le contenu de la réponse
			const responseText = await response.text();
			console.log('Contenu de la réponse:', responseText);

			// Vérifier si c'est du JSON valide
			let result;
			try {
				result = JSON.parse(responseText);
				console.log('Réponse parsée:', result);
			} catch (parseError) {
				console.error('Erreur de parsing JSON:', parseError);
				console.error('Contenu non-JSON reçu:', responseText);

				// Si ce n'est pas du JSON, essayer de comprendre le type de contenu
				const contentType = response.headers.get("content-type");
				if (contentType?.includes("text/html")) {
					throw new Error('Le serveur a retourné une page HTML (erreur de configuration)');
				} else if (contentType?.includes("text/plain")) {
					throw new Error(`Erreur du serveur: ${responseText}`);
				} else {
					throw new Error(`Réponse invalide du serveur (${contentType || 'type inconnu'})`);
				}
			}

			if (!response.ok) {
				// Améliorer les messages d'erreur
				let errorMessage = result.error || result.message || `Erreur ${response.status}: ${response.statusText}`;

				// Messages d'erreur plus parlants selon le contexte
				if (response.status === 400) {
					if (errorMessage.includes('email')) {
						errorMessage = 'Cette adresse email est déjà utilisée';
					} else if (errorMessage.includes('password')) {
						errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité';
					} else if (errorMessage.includes('role')) {
						errorMessage = 'Le rôle sélectionné n\'est pas valide';
					} else if (errorMessage.includes('required')) {
						errorMessage = 'Tous les champs obligatoires doivent être remplis';
					} else {
						errorMessage = 'Les données fournies sont incomplètes ou incorrectes';
					}
				} else if (response.status === 401) {
					errorMessage = 'Session expirée - veuillez vous reconnecter';
				} else if (response.status === 403) {
					errorMessage = 'Vous n\'avez pas les permissions pour effectuer cette action';
				} else if (response.status === 404) {
					errorMessage = 'Utilisateur introuvable';
				} else if (response.status === 409) {
					errorMessage = 'Un utilisateur avec cette adresse email existe déjà';
				} else if (response.status === 422) {
					errorMessage = 'Les données fournies ne respectent pas le format attendu';
				} else if (response.status === 500) {
					errorMessage = 'Erreur interne du serveur - veuillez réessayer plus tard';
				}

				throw new Error(errorMessage);
			}

			notifications.show({
				title: 'Succès',
				message: isEditing
					? 'Utilisateur système modifié avec succès'
					: 'Utilisateur système créé avec succès',
				color: 'green',
				icon: <IconCheck size={16} />,
			});

			onSuccess();
			onClose();
			form.reset();

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
			setError(errorMessage);

			console.error('Erreur lors de la soumission:', err);

			notifications.show({
				title: 'Erreur',
				message: errorMessage,
				color: 'red',
				icon: <IconX size={16} />,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!user) return;

		// Confirmation pour suppression avec plus de détails
		const confirmDelete = confirm(
			`Êtes-vous sûr de vouloir supprimer cet utilisateur système ?\n\n` +
			`⚠️  ATTENTION : Cette action est irréversible !\n\n` +
			`Utilisateur à supprimer :\n` +
			`• Email: ${user.email}\n` +
			`• Nom: ${user.firstName} ${user.lastName}\n` +
			`• Rôle: ${user.role}\n\n` +
			`Cette action supprimera définitivement l'utilisateur et toutes ses données associées.`
		);

		if (!confirmDelete) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const token = authService.getToken();
			if (!token) {
				throw new Error('Token d\'authentification manquant');
			}

			const response = await fetch(`/api/users/${user.id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				const responseText = await response.text();
				console.error("Réponse non-JSON:", responseText);
				throw new Error('Réponse invalide du serveur');
			}

			const result = await response.json();
			console.log('Réponse du serveur (suppression):', result);

			if (!response.ok) {
				// Améliorer les messages d'erreur
				let errorMessage = result.error || result.message || `Erreur ${response.status}: ${response.statusText}`;

				if (response.status === 401) {
					errorMessage = 'Session expirée - veuillez vous reconnecter';
				} else if (response.status === 403) {
					errorMessage = 'Vous n\'avez pas les permissions pour supprimer cet utilisateur';
				} else if (response.status === 404) {
					errorMessage = 'Utilisateur introuvable';
				} else if (response.status === 409) {
					errorMessage = 'Impossible de supprimer cet utilisateur (peut-être en cours d\'utilisation)';
				}

				throw new Error(errorMessage);
			}

			notifications.show({
				title: 'Succès',
				message: 'Utilisateur système supprimé avec succès',
				color: 'green',
				icon: <IconCheck size={16} />,
			});

			onSuccess();
			onClose();

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
			setError(errorMessage);

			console.error('Erreur lors de la suppression:', err);

			notifications.show({
				title: 'Erreur',
				message: errorMessage,
				color: 'red',
				icon: <IconX size={16} />,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={isEditing ? 'Modifier l\'utilisateur système' : 'Ajouter un utilisateur système'}
			size="md"
			centered
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					{error && (
						<Alert
							icon={<IconAlertCircle size={16} />}
							title="Erreur"
							color="red"
							variant="light"
						>
							{error}
						</Alert>
					)}

					<TextInput
						label="Email"
						placeholder="exemple@email.com"
						required
						{...form.getInputProps('email')}
					/>

					<PasswordInput
						label={isEditing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
						placeholder={isEditing ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
						required={!isEditing}
						{...form.getInputProps('password')}
					/>

					<TextInput
						label="Prénom"
						placeholder="Prénom"
						required
						{...form.getInputProps('firstName')}
					/>

					<TextInput
						label="Nom"
						placeholder="Nom"
						required
						{...form.getInputProps('lastName')}
					/>

					<TextInput
						label="Titre"
						placeholder="Titre"
						{...form.getInputProps('title')}
					/>

					<TextInput
						label="Spécialité"
						placeholder="Spécialité"
						{...form.getInputProps('specialty')}
					/>

					<TextInput
						label="Téléphone"
						placeholder="Téléphone"
						{...form.getInputProps('phoneNumber')}
					/>

					<Select
						label="Rôle"
						placeholder="Sélectionner un rôle"
						data={[
							{ value: 'SPADMIN', label: 'Super Administrateur' },
							{ value: 'ADMIN', label: 'Administrateur' },
							{ value: 'MANAGER', label: 'Manager' },
						]}
						required
						{...form.getInputProps('role')}
					/>

					<Group justify="space-between" mt="md">
						<Group>
							<Button
								type="submit"
								loading={loading}
								disabled={loading}
							>
								{isEditing ? 'Modifier' : 'Créer'}
							</Button>

							<Button
								variant="outline"
								onClick={onClose}
								disabled={loading}
							>
								Annuler
							</Button>
						</Group>

						{isEditing && (
							<Button
								variant="outline"
								color="red"
								onClick={handleDelete}
								loading={loading}
								disabled={loading}
							>
								Supprimer
							</Button>
						)}
					</Group>
				</Stack>
			</form>

			<LoadingOverlay visible={loading} />
		</Modal>
	);
};

export default UserForm;

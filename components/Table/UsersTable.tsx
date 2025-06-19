"use client";
// table de gestion des utilisateurs

import React, { useState, useEffect } from 'react';
import { Button, Group, Stack, Text, ActionIcon, Tooltip, Alert } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SimpleTable } from './SimpleTable';
import UserForm from '../Form/UserForm';
import { MRT_ColumnDef, MRT_Row, MRT_PaginationState, MRT_SortingState } from 'mantine-react-table';
import { authService } from '@/services/auth.service';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	title?: string;
	specialty?: string;
	phoneNumber?: string;
	role: 'SPADMIN' | 'ADMIN' | 'MANAGER';
	createdAt: string;
	updatedAt: string;
}

interface UsersTableProps {
	refreshTrigger: number;
}

const UsersTable: React.FC<UsersTableProps> = ({ refreshTrigger }) => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [userFormOpened, setUserFormOpened] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<MRT_SortingState>([]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const token = authService.getToken();
			if (!token) {
				throw new Error('Token d\'authentification manquant');
			}

			// Utiliser la nouvelle route pour récupérer uniquement les admins
			const response = await fetch('/api/users/admins', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Erreur ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			// La nouvelle route retourne directement les admins
			if (Array.isArray(data)) {
				setUsers(data);
			} else if (data.users && Array.isArray(data.users)) {
				// Fallback si la réponse est encapsulée
				setUsers(data.users);
			} else {
				console.warn('Format de réponse inattendu:', data);
				setUsers([]);
			}
		} catch (error) {
			console.error('Erreur lors du chargement des utilisateurs système:', error);
			notifications.show({
				title: 'Erreur',
				message: 'Impossible de charger les utilisateurs système',
				color: 'red',
			});
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [refreshTrigger]);

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setUserFormOpened(true);
	};

	const handleAddUser = () => {
		setEditingUser(null);
		setUserFormOpened(true);
	};

	const handleFormSuccess = () => {
		fetchUsers(); // Recharger la liste après modification
	};

	const handleFormClose = () => {
		setUserFormOpened(false);
		setEditingUser(null);
	};

	const getRoleLabel = (role: string) => {
		switch (role) {
			case 'SPADMIN':
				return 'Super Administrateur';
			case 'ADMIN':
				return 'Administrateur';
			case 'MANAGER':
				return 'Manager';
			default:
				return role;
		}
	};

	const columns: MRT_ColumnDef<User>[] = [
		{
			accessorKey: 'email',
			header: 'Email',
			size: 200,
		},
		{
			accessorKey: 'title',
			header: 'Titre',
			size: 120,
		},
		{
			accessorKey: 'firstName',
			header: 'Prénom',
			size: 150,
		},
		{
			accessorKey: 'lastName',
			header: 'Nom',
			size: 150,
		},
		{
			accessorKey: 'specialty',
			header: 'Spécialité',
			size: 150,
		},
		{
			accessorKey: 'phoneNumber',
			header: 'Téléphone',
			size: 120,
		},
		{
			accessorKey: 'role',
			header: 'Rôle',
			size: 120,
			Cell: ({ cell }) => (
				<Text size="sm" fw={500}>
					{getRoleLabel(cell.getValue<string>())}
				</Text>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Créé le',
			size: 120,
			Cell: ({ cell }) => (
				<Text size="sm">
					{new Date(cell.getValue<string>()).toLocaleDateString('fr-FR')}
				</Text>
			),
		},
	];

	return (
		<ProtectedRoute requiredRoles={['SPADMIN', 'ADMIN']}>
			<Stack gap="md">
				<Group justify="space-between">
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={handleAddUser}
						variant="filled"
					>
						Ajouter un utilisateur système
					</Button>
				</Group>

				<SimpleTable
					data={users}
					columns={columns}
					state={{
						isLoading: loading,
						pagination,
						sorting,
					}}
					onPaginationChange={setPagination}
					onSortingChange={setSorting}
					enableRowSelection={false}
					enableRowActions={true}
					onEdit={handleEditUser}
				/>

				<UserForm
					opened={userFormOpened}
					onClose={handleFormClose}
					user={editingUser as User}
					onSuccess={handleFormSuccess}
				/>
			</Stack>
		</ProtectedRoute>
	);
};

export default UsersTable;

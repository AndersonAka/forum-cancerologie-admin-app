"use client";
// table de gestion des utilisateurs

import { SimpleTable } from "./SimpleTable";
import { ActionIcon, Group, Text, Badge } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { MRT_PaginationState, MRT_SortingState } from "mantine-react-table";

interface User {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	title: string;
	specialty: string;
	country: string;
	workplace: string;
	phoneNumber: string;
	participationMode: "online" | "in_person";
	gdprConsent: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const UsersTable = () => {
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<MRT_SortingState>([]);
	const [totalCount, setTotalCount] = useState(0);

	const columns = [
		{
			header: "Nom complet",
			accessorFn: (row: User) => `${row.title} ${row.firstName} ${row.lastName}`,
		},
		{
			header: "Email",
			accessorKey: "email",
		},
		{
			header: "Spécialité",
			accessorKey: "specialty",
		},
		{
			header: "Pays",
			accessorKey: "country",
		},
		{
			header: "Mode de participation",
			accessorKey: "participationMode",
			Cell: ({ row }: { row: { original: User } }) => (
				<Badge
					color={row.original.participationMode === "online" ? "blue" : "green"}
				>
					{row.original.participationMode === "online" ? "En ligne" : "Présentiel"}
				</Badge>
			),
		},
		{
			header: "Consentement RGPD",
			accessorKey: "gdprConsent",
			Cell: ({ row }: { row: { original: User } }) => (
				<Badge color={row.original.gdprConsent ? "green" : "red"}>
					{row.original.gdprConsent ? "Oui" : "Non"}
				</Badge>
			),
		},
	];

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const skip = pagination.pageIndex * pagination.pageSize;
			const take = pagination.pageSize;
			const orderBy = sorting.length > 0
				? { [sorting[0].id]: sorting[0].desc ? "desc" : "asc" }
				: undefined;

			const params = new URLSearchParams();
			params.append("skip", skip.toString());
			params.append("take", take.toString());
			if (orderBy) {
				params.append("orderBy", JSON.stringify(orderBy));
			}

			const response = await fetch(
				`/api/users?${params.toString()}`,
				{
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Erreur lors du chargement des utilisateurs");
			}

			const data = await response.json();
			setUsers(data.users);
			setTotalCount(data.pagination.totalCount);
			setLoading(false);
		} catch (error) {
			notifications.show({
				title: "Erreur",
				message: "Erreur lors du chargement des utilisateurs",
				color: "red",
			});
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [pagination.pageIndex, pagination.pageSize, sorting]);

	const handleAdd = () => {
		router.push("/dashboard/users/new");
	};

	const handleEdit = (user: User) => {
		router.push(`/dashboard/users/${user.id}/edit`);
	};

	const handleDelete = async (user: User) => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
			try {
				const response = await fetch(`/api/users/${user.id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error("Erreur lors de la suppression");
				}

				notifications.show({
					title: "Succès",
					message: "Utilisateur supprimé avec succès",
					color: "green",
				});

				fetchUsers(); // Recharger les données
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors de la suppression de l'utilisateur",
					color: "red",
				});
			}
		}
	};

	return (
		<SimpleTable
			title="Gestion des utilisateurs"
			columns={columns}
			data={users}
			onAdd={handleAdd}
			onEdit={handleEdit}
			onDelete={handleDelete}
			enableRowActions
			state={{
				pagination,
				sorting,
				isLoading: loading,
			}}
			onPaginationChange={setPagination}
			onSortingChange={setSorting}
			rowCount={totalCount}
			enablePagination
			enableSorting
		/>
	);
};

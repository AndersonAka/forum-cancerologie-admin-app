"use client";

import { useMemo, useState } from "react";
import { Alert, Paper, Stack, Text, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { type MRT_ColumnDef, type MRT_PaginationState, type MRT_SortingState } from "mantine-react-table";
import { SimpleTable } from "../Table/SimpleTable";
import { usePageVisits, useAllPageVisits } from "@/hooks/usePageVisits";
import { FormattedPageVisit } from "@/services/pageVisits.service";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import PageVisitsChart from "./PageVisitsChart";
import PageVisitsReport from "./PageVisitsReport";

export default function PageVisitsTable() {
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [sorting, setSorting] = useState<MRT_SortingState>([
		{ id: "dateVisited", desc: true }, // Tri par défaut sur la date (plus récent en premier)
	]);

	const { pageVisits, loading, error, totalCount } = usePageVisits(pagination);
	const { allPageVisits: allVisitsForChart } = useAllPageVisits();

	const columns = useMemo<MRT_ColumnDef<FormattedPageVisit>[]>(
		() => [
			{
				accessorKey: "id",
				header: "ID Visite",
				size: 80,
			},
			{
				accessorKey: "userName",
				header: "Utilisateur",
				size: 200,
			},
			{
				accessorKey: "userEmail",
				header: "Email",
				size: 250,
			},
			{
				accessorKey: "pageUrl",
				header: "URL de la page",
				size: 300,
				Cell: ({ cell }) => {
					const url = cell.getValue<string>();
					return (
						<Text
							component="a"
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							style={{ color: "var(--mantine-color-blue-6)", textDecoration: "underline" }}
							truncate
						>
							{url}
						</Text>
					);
				},
			},
			{
				accessorKey: "timeSpentFormatted",
				header: "Temps passé",
				size: 120,
				Cell: ({ cell }) => {
					const time = cell.getValue<string>();
					return <Text>{time}</Text>;
				},
			},
			{
				accessorKey: "dateVisited",
				header: "Date de visite",
				size: 180,
				sortingFn: (rowA, rowB) => {
					// Utiliser createdAt pour le tri car c'est la date ISO
					const dateA = new Date(rowA.original.createdAt).getTime();
					const dateB = new Date(rowB.original.createdAt).getTime();
					return dateA - dateB;
				},
			},
		],
		[]
	);

	// Fonction de transformation pour l'export
	const exportTransform = (visit: FormattedPageVisit) => ({
		"ID Visite": visit.id,
		"ID Utilisateur": visit.userId,
		"Prénom": visit.userName.split(" ")[0],
		"Nom": visit.userName.split(" ").slice(1).join(" "),
		"Nom complet": visit.userName,
		Email: visit.userEmail,
		"URL de la page": visit.pageUrl,
		"Temps passé (secondes)": visit.timeSpent || "",
		"Temps passé (formaté)": visit.timeSpentFormatted,
		"Date de visite": visit.dateVisited,
	});

	if (loading) {
		return (
			<Paper withBorder radius="md" p="xl">
				<Stack align="center" gap="md">
					<LoadingSpinner />
					<Text>Chargement des visites...</Text>
				</Stack>
			</Paper>
		);
	}

	if (error) {
		return (
			<Paper withBorder radius="md" p="md">
				<Alert
					icon={<IconAlertCircle size={16} />}
					title="Erreur"
					color="red"
					variant="light"
				>
					{error}
				</Alert>
			</Paper>
		);
	}

	if (pageVisits.length === 0) {
		return (
			<Paper withBorder radius="md" p="xl">
				<Stack align="center" gap="md">
					<Text c="dimmed" size="lg">
						Aucune visite de page enregistrée.
					</Text>
				</Stack>
			</Paper>
		);
	}

	return (
		<Stack gap="lg">
			{/* Graphique des pages les plus visitées */}
			{allVisitsForChart.length > 0 && (
				<PageVisitsChart pageVisits={allVisitsForChart} />
			)}

			{/* Tableau des visites */}
			<Paper withBorder radius="md" p="md">
				<Stack gap="md">
					<Group justify="space-between" align="center">
						<Text c="dimmed" size="sm">
							Total: {totalCount} visite(s)
							{pageVisits.length < totalCount &&
								` (Affichage de ${pageVisits.length} sur cette page)`}
						</Text>
						<PageVisitsReport
							allPageVisits={allVisitsForChart}
							totalCount={totalCount}
						/>
					</Group>

					<SimpleTable
						columns={columns}
						data={pageVisits}
						state={{
							pagination,
							sorting,
							isLoading: loading,
						}}
						onPaginationChange={setPagination}
						onSortingChange={setSorting}
						rowCount={totalCount}
						enablePagination={true}
						enableSorting={true}
						enableExport={false}
						exportFileName={`page-visits-${new Date().toISOString().slice(0, 10)}`}
						exportTransform={exportTransform}
						enableRowActions={false}
						enableRowSelection={false}
					/>
				</Stack>
			</Paper>
		</Stack>
	);
}


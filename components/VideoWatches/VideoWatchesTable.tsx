"use client";

import { useMemo, useState } from "react";
import { Alert, Paper, Stack, Text, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { type MRT_ColumnDef, type MRT_PaginationState, type MRT_SortingState } from "mantine-react-table";
import { SimpleTable } from "../Table/SimpleTable";
import { useVideoWatches, useAllVideoWatches } from "@/hooks/useVideoWatches";
import { FormattedVideoWatch } from "@/services/videoWatches.service";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import VideoWatchesChart from "./VideoWatchesChart";
import VideoWatchesReport from "./VideoWatchesReport";

export default function VideoWatchesTable() {
	const [pagination, setPagination] = useState<MRT_PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [sorting, setSorting] = useState<MRT_SortingState>([
		{ id: "dateVisualisation", desc: true }, // Tri par défaut sur la date (plus récent en premier)
	]);

	const { videoWatches, loading, error, totalCount } = useVideoWatches(pagination);
	const { allVideoWatches: allWatchesForChart } = useAllVideoWatches();

	const columns = useMemo<MRT_ColumnDef<FormattedVideoWatch>[]>(
		() => [
			{
				accessorKey: "id",
				header: "ID",
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
				accessorKey: "videoId",
				header: "ID Vidéo",
				size: 150,
			},
			{
				accessorKey: "auteur",
				header: "Auteur",
				size: 150,
			},
			{
				accessorKey: "durationFormatted",
				header: "Durée",
				size: 100,
			},
			{
				accessorKey: "progressFormatted",
				header: "Progression",
				size: 120,
				Cell: ({ cell }) => {
					const progress = cell.getValue<string>();
					return <Text>{progress}</Text>;
				},
			},
			// Colonne Statut masquée temporairement
			// {
			// 	accessorKey: "completedFormatted",
			// 	header: "Statut",
			// 	size: 130,
			// 	Cell: ({ row }) => {
			// 		const completed = row.original.completed;
			// 		return (
			// 			<Badge color={completed ? "green" : "yellow"} variant="light">
			// 				{row.original.completedFormatted}
			// 			</Badge>
			// 		);
			// 	},
			// },
			{
				accessorKey: "dateVisualisation",
				header: "Date de visualisation",
				size: 180,
				sortingFn: (rowA, rowB) => {
					// Utiliser dateVisualisationISO pour le tri car c'est la date ISO
					const dateA = new Date(rowA.original.dateVisualisationISO).getTime();
					const dateB = new Date(rowB.original.dateVisualisationISO).getTime();
					return dateA - dateB;
				},
			},
		],
		[]
	);

	// Fonction de transformation pour l'export
	const exportTransform = (watch: FormattedVideoWatch) => ({
		"ID": watch.id,
		"ID Utilisateur": watch.userId,
		"Prénom": watch.userName.split(" ")[0],
		"Nom": watch.userName.split(" ").slice(1).join(" "),
		"Nom complet": watch.userName,
		Email: watch.userEmail,
		"ID Vidéo": watch.videoId,
		Auteur: watch.auteur,
		"Durée (secondes)": watch.duration || "",
		"Durée (formaté)": watch.durationFormatted,
		"Progression (%)": watch.progress || "",
		"Progression (formaté)": watch.progressFormatted,
		Complétée: watch.completed ? "Oui" : "Non",
		"Statut": watch.completedFormatted,
		"Date de visualisation": watch.dateVisualisation,
		"Heure de début": watch.startTime,
	});

	if (loading) {
		return (
			<Paper withBorder radius="md" p="xl">
				<Stack align="center" gap="md">
					<LoadingSpinner />
					<Text>Chargement des vidéos regardées...</Text>
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

	if (videoWatches.length === 0) {
		return (
			<Paper withBorder radius="md" p="xl">
				<Stack align="center" gap="md">
					<Text c="dimmed" size="lg">
						Aucune vidéo regardée enregistrée.
					</Text>
				</Stack>
			</Paper>
		);
	}

	return (
		<Stack gap="lg">
			{/* Graphique des vidéos les plus regardées */}
			{allWatchesForChart.length > 0 && (
				<VideoWatchesChart videoWatches={allWatchesForChart} />
			)}

			{/* Tableau des vidéos regardées */}
			<Paper withBorder radius="md" p="md">
				<Stack gap="md">
					<Group justify="space-between" align="center">
						<Text c="dimmed" size="sm">
							Total: {totalCount} visualisation(s)
							{videoWatches.length < totalCount &&
								` (Affichage de ${videoWatches.length} sur cette page)`}
						</Text>
						<VideoWatchesReport
							allVideoWatches={allWatchesForChart}
							totalCount={totalCount}
						/>
					</Group>

					<SimpleTable
						columns={columns}
						data={videoWatches}
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
						exportFileName={`video-watches-${new Date().toISOString().slice(0, 10)}`}
						exportTransform={exportTransform}
						enableRowActions={false}
						enableRowSelection={false}
					/>
				</Stack>
			</Paper>
		</Stack>
	);
}


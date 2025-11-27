"use client";

import { useMemo } from "react";
import { Paper, Text, Group, Box } from "@mantine/core";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { FormattedVideoWatch } from "@/services/videoWatches.service";

interface VideoWatchesChartProps {
	videoWatches: FormattedVideoWatch[];
}

export default function VideoWatchesChart({ videoWatches }: VideoWatchesChartProps) {
	// Agréger les données par videoId
	const chartData = useMemo(() => {
		const videoCounts = new Map<string, { count: number; auteur: string }>();

		videoWatches.forEach((watch) => {
			const videoId = watch.videoId;
			const existing = videoCounts.get(videoId) || { count: 0, auteur: watch.auteur };
			videoCounts.set(videoId, {
				count: existing.count + 1,
				auteur: watch.auteur,
			});
		});

		// Convertir en tableau et trier par nombre de visualisations (décroissant)
		const sortedData = Array.from(videoCounts.entries())
			.map(([videoId, data]) => ({
				videoId: videoId.length > 25 ? `${videoId.substring(0, 25)}...` : videoId,
				fullVideoId: videoId,
				auteur: data.auteur,
				count: data.count,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10); // Top 10

		return sortedData;
	}, [videoWatches]);

	if (chartData.length === 0) {
		return (
			<Paper p="md" radius="md" withBorder>
				<Text c="dimmed" ta="center" py="xl">
					Aucune donnée disponible pour le graphique
				</Text>
			</Paper>
		);
	}

	return (
		<Paper p="md" radius="md" withBorder>
			<Group mb="md" justify="space-between">
				<Text fw={700} size="lg">
					Vidéos les plus regardées
				</Text>
			</Group>
			<Box w="100%" h={400}>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="videoId"
							angle={-45}
							textAnchor="end"
							height={100}
							interval={0}
						/>
						<YAxis />
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const data = payload[0].payload;
									return (
										<Box
											bg="white"
											p="xs"
											style={{ border: "1px solid #ccc", borderRadius: "4px" }}
										>
											<Text fw={700} size="sm" mb={4}>
												{data.fullVideoId}
											</Text>
											<Text size="sm" c="dimmed" mb={2}>
												Auteur: {data.auteur}
											</Text>
											<Text size="sm" c="blue">
												Visualisations: {data.count}
											</Text>
										</Box>
									);
								}
								return null;
							}}
						/>
						<Legend />
						<Bar dataKey="count" fill="#228be6" name="Nombre de visualisations" />
					</BarChart>
				</ResponsiveContainer>
			</Box>
		</Paper>
	);
}


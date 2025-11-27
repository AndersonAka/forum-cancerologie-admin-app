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
import { FormattedPageVisit } from "@/services/pageVisits.service";

interface PageVisitsChartProps {
	pageVisits: FormattedPageVisit[];
}

export default function PageVisitsChart({ pageVisits }: PageVisitsChartProps) {
	// Agréger les données par pageUrl
	const chartData = useMemo(() => {
		const pageCounts = new Map<string, number>();

		pageVisits.forEach((visit) => {
			const url = visit.pageUrl;
			const currentCount = pageCounts.get(url) || 0;
			pageCounts.set(url, currentCount + 1);
		});

		// Convertir en tableau et trier par nombre de visites (décroissant)
		const sortedData = Array.from(pageCounts.entries())
			.map(([pageUrl, count]) => ({
				pageUrl: pageUrl.length > 30 ? `${pageUrl.substring(0, 30)}...` : pageUrl,
				fullUrl: pageUrl,
				count,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10); // Top 10

		return sortedData;
	}, [pageVisits]);

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
					Pages les plus visitées
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
							dataKey="pageUrl"
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
											{data.fullUrl}
										</Text>
										<Text size="sm" c="blue">
											Visites: {data.count}
										</Text>
									</Box>
								);
							}
							return null;
						}}
						/>
						<Legend />
						<Bar dataKey="count" fill="#228be6" name="Nombre de visites" />
					</BarChart>
				</ResponsiveContainer>
			</Box>
		</Paper>
	);
}


"use client";

import { Flex, Grid, GridCol, Paper, Text, Group, RingProgress, Stack, Transition, Loader, Alert } from "@mantine/core";
import { BalanceCard } from "./BalanceCard";
import { OverviewCard } from "./OverviewCard";
import { ProfileCard } from "./ProfileCard";
import { TransactionCard } from "./TransactionCard";
import { WelcomeCard } from "./WelcomeCard";
import { StatsGroup } from "../StatsGroup";
import { mockData } from "../StatsGroup/mock";
import { IconUsers, IconClock, IconEye, IconChartBar, IconAlertCircle } from "@tabler/icons-react";
import { ActivityChart } from "./charts/ActivityChart";
import { GeoDistributionChart } from "./charts/GeoDistributionChart";
import { useEffect, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

interface KpiCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	delay: number;
}

const KpiCard = ({ title, value, icon, color, delay }: KpiCardProps) => (
	<Transition mounted transition="slide-up" duration={400} timingFunction="ease">
		{(styles) => (
			<Paper
				p="md"
				radius="md"
				withBorder
				style={styles}
				shadow="sm"
				className="hover:shadow-md transition-shadow duration-200"
			>
				<Group justify="space-between">
					<div>
						<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
							{title}
						</Text>
						<Text fw={700} size="xl" mt={4}>
							{value}
						</Text>
					</div>
					<RingProgress
						size={80}
						roundCaps
						thickness={8}
						sections={[{ value: 100, color }]}
						label={
							<Group justify="center" align="center" h="100%">
								{icon}
							</Group>
						}
					/>
				</Group>
			</Paper>
		)}
	</Transition>
);

export const DashboardContent = () => {
	const [mounted, setMounted] = useState(false);
	const { data, loading, error } = useDashboardData();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (loading) {
		return (
			<Group justify="center" align="center" h={400}>
				<Loader size="xl" />
			</Group>
		);
	}

	if (error) {
		return (
			<Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
				{error}
			</Alert>
		);
	}

	if (!data) {
		return null;
	}

	return (
		<Stack gap="lg">
			<Grid>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Utilisateurs Totaux"
						value={data.metrics.totalUsers}
						icon={<IconUsers size={24} />}
						color="blue"
						delay={100}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Temps Moyen de Session"
						value={data.metrics.avgSessionTime}
						icon={<IconClock size={24} />}
						color="green"
						delay={200}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Pages Vues"
						value={data.metrics.pageViews}
						icon={<IconEye size={24} />}
						color="orange"
						delay={300}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
					<KpiCard
						title="Taux d'Engagement"
						value={data.metrics.engagementRate}
						icon={<IconChartBar size={24} />}
						color="grape"
						delay={400}
					/>
				</Grid.Col>
			</Grid>

			<Transition mounted={mounted} transition="fade" duration={400} timingFunction="ease">
				{(styles) => (
					<Grid style={styles}>
						<Grid.Col span={{ base: 12, lg: 8 }}>
							<Paper
								p="md"
								radius="md"
								withBorder
								shadow="sm"
								className="hover:shadow-md transition-shadow duration-200"
							>
								<ActivityChart
									data={data.activityData}
									title="Activité des Utilisateurs"
								/>
							</Paper>
						</Grid.Col>
						<Grid.Col span={{ base: 12, lg: 4 }}>
							<Paper
								p="md"
								radius="md"
								withBorder
								shadow="sm"
								className="hover:shadow-md transition-shadow duration-200"
							>
								<GeoDistributionChart
									data={data.geoData}
									title="Distribution Géographique"
								/>
							</Paper>
						</Grid.Col>
					</Grid>
				)}
			</Transition>

			{/* <Grid>
				<GridCol span={{ sm: 12, md: 12, lg: 4 }}>
					<ProfileCard />
				</GridCol>
				<GridCol span={{ sm: 12, md: 12, lg: 8 }}>
					<Flex direction="column" h="100%" justify="space-between" gap="md">
						<WelcomeCard />
						<StatsGroup data={mockData} />
					</Flex>
				</GridCol>
				<GridCol span={{ sm: 12, md: 12, lg: 8 }}>
					<BalanceCard />
				</GridCol>
				<GridCol span={{ sm: 12, md: 12, lg: 4 }}>
					<OverviewCard />
				</GridCol>
				<GridCol span={12}>
					<TransactionCard />
				</GridCol>
			</Grid> */}
		</Stack>
	);
};

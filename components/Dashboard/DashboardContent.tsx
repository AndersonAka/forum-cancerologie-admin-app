"use client";

import { Grid, Text, Group, Stack, Transition, Loader, Alert, Badge, Card, Timeline, Avatar, Box, Divider } from "@mantine/core";
import { IconUsers, IconAlertCircle, IconActivity, IconWifi, IconUsersGroup } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { PageContainer } from "../PageContainer/PageContainer";
import dynamic from "next/dynamic";
import TitrePage from "components/TitrePage/TitrePage";
import { DashboardSkeleton } from "../LoadingSpinner/LoadingSpinner";

// Import dynamique du composant de graphique
const GeoDistributionChart = dynamic(
	() => import("./charts/GeoDistributionChart"),
	{
		ssr: false,
		loading: () => <Loader size="md" />,
	}
);

interface KpiCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	delay: number;
	subtitle?: string;
	trend?: string;
}

const KpiCard = ({ title, value, icon, color, delay, subtitle, trend }: KpiCardProps) => (
	<Transition mounted transition="slide-up" duration={400} timingFunction="ease">
		{(styles) => (
			<Card
				p="xl"
				radius="lg"
				withBorder
				shadow="sm"
				className="hover:shadow-lg transition-all duration-300 border-0"
				h="100%"
				style={{
					...styles,
					background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
					border: `1px solid ${color}20`,
				}}
			>
				<Stack gap="md" h="100%">
					<Group justify="space-between" align="flex-start">
						<Box>
							<Text size="sm" c="dimmed" tt="uppercase" fw={600} mb={4}>
								{title}
							</Text>
							<Text fw={800} size="2rem" lh={1}>
								{value}
							</Text>
							{subtitle && (
								<Text size="xs" c="dimmed" mt={4}>
									{trend && (
										<Badge size="xs" variant="light" color={trend.startsWith('+') ? 'green' : 'red'} mr={6}>
											{trend}
										</Badge>
									)}
									{subtitle}
								</Text>
							)}
						</Box>
						<Box
							style={{
								background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
								borderRadius: '12px',
								padding: '12px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '48px',
								height: '48px',
							}}
						>
							{icon}
						</Box>
					</Group>
				</Stack>
			</Card>
		)}
	</Transition>
);

const ActivityTimeline = ({ activities }: { activities: any[] }) => {
	return (
		<Card p="xl" radius="lg" withBorder h="100%" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
			<Stack gap="lg" h="100%">
				<Group>
					<Box
						style={{
							background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
							borderRadius: '12px',
							padding: '12px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '48px',
							height: '48px',
						}}
					>
						<IconActivity size={24} color="white" />
					</Box>
					<Box>
						<Text fw={700} size="lg">Activités Récentes</Text>
						<Text size="sm" c="dimmed">Dernières actions des participants</Text>
					</Box>
				</Group>

				<Divider />

				{activities && activities.length > 0 ? (
					<Timeline active={activities.length - 1} bulletSize={20} lineWidth={2} color="blue">
						{activities.slice(0, 5).map((activity, index) => (
							<Timeline.Item key={activity.id || index} bullet={<Avatar size={20} radius="xl" bg="blue" />}>
								<Box>
									<Text size="sm" fw={600} mb={2}>
										{activity.user?.firstName} {activity.user?.lastName}
									</Text>
									<Text size="xs" c="dimmed" mb={4} style={{ lineHeight: 1.4 }}>
										{activity.description}
									</Text>
									<Text size="xs" c="dimmed">
										{new Date(activity.timestamp).toLocaleString('fr-FR', {
											day: 'numeric',
											month: 'short',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</Text>
								</Box>
							</Timeline.Item>
						))}
					</Timeline>
				) : (
					<Text c="dimmed" ta="center" py="xl">
						Aucune activité récente disponible
					</Text>
				)}
			</Stack>
		</Card>
	);
};

const TopContentCard = ({ title, data, icon, color = "blue" }: { title: string; data: any[]; icon: React.ReactNode; color?: string }) => (
	<Card p="xl" radius="lg" withBorder h="100%" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
		<Stack gap="lg" h="100%">
			<Group>
				<Box
					style={{
						background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
						borderRadius: '12px',
						padding: '12px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '48px',
						height: '48px',
					}}
				>
					{icon}
				</Box>
				<Box>
					<Text fw={700} size="lg">{title}</Text>
					<Text size="sm" c="dimmed">Contenu le plus populaire</Text>
				</Box>
			</Group>

			<Divider />

			<Stack gap="md">
				{data.slice(0, 5).map((item, index) => (
					<Group key={index} justify="space-between" p="xs" style={{
						background: 'white',
						borderRadius: '8px',
						border: '1px solid #e2e8f0'
					}}>
						<Text size="sm" style={{ flex: 1 }} fw={500}>
							{title.includes('Vidéos') ? item.auteur : item.query || item.contentType}
						</Text>
						<Badge size="sm" variant="filled" color={color}>
							{title.includes('Vidéos') ? `${item.views} vues` :
								title.includes('Recherches') ? item.count :
									item.interactions}
						</Badge>
					</Group>
				))}
			</Stack>
		</Stack>
	</Card>
);

const ChartsSection = ({ data, mounted, chartLoaded }: { data: any; mounted: boolean; chartLoaded: boolean }) => {
	return (
		<Transition mounted={mounted && chartLoaded} transition="fade" duration={400} timingFunction="ease">
			{(styles) => (
				<Grid gutter="lg" style={styles}>
					<Grid.Col span={{ base: 12, lg: 12 }}>
						<Card p="xl" radius="lg" withBorder h="100%" style={{ background: 'white' }}>
							{data.geoData && data.geoData.length > 0 ? (
								<>
									<div style={{ height: '400px', width: '100%' }}>
										<GeoDistributionChart
											data={data.geoData}
											title="Répartition des participants par pays"
										/>
									</div>
								</>
							) : (
								<Text c="dimmed" ta="center" py="xl">
									Aucune donnée géographique disponible
								</Text>
							)}
						</Card>
					</Grid.Col>
				</Grid>
			)}
		</Transition>
	);
};

export const DashboardContent = () => {
	const [mounted, setMounted] = useState(false);
	const [chartLoaded, setChartLoaded] = useState(false);
	const { data, loading, error } = useDashboardData();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Marquer le graphique comme chargé après un délai
	useEffect(() => {
		if (mounted && data) {
			const timer = setTimeout(() => {
				setChartLoaded(true);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [mounted, data]);

	// Rendu côté client uniquement
	if (!mounted) {
		return null;
	}

	if (loading) {
		return (
			<PageContainer title={<TitrePage title="Tableau de bord" subtitle="Vue d'ensemble du forum" />}>
				<DashboardSkeleton />
			</PageContainer>
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
		<>
			<PageContainer title={<TitrePage title="Tableau de bord" subtitle="Vue d'ensemble du forum" />}>

				<Stack gap="xl">
					{/* KPIs Principaux */}
					<Grid gutter="lg">
						<Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
							<KpiCard
								title="Participants"
								value={data.metrics.totalParticipants}
								icon={<IconUsers size={24} color="white" />}
								color="#3b82f6"
								delay={100}
								subtitle={`+${data.metrics.newUsersThisMonth} ce mois`}
								trend={data.metrics.userGrowthRate}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
							<KpiCard
								title="En ligne"
								value={data.metrics.nbreParticipantEnligne}
								icon={<IconWifi size={24} color="white" />}
								color="#10b981"
								delay={300}
								subtitle="Participant(s) en ligne"
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
							<KpiCard
								title="En Présentiel"
								value={data.metrics.nbreParticipantPresentiel}
								icon={<IconUsersGroup size={24} color="white" />}
								color="#8b5cf6"
								delay={500}
								subtitle="Participant(s) en présentiel"
							/>
						</Grid.Col>
					</Grid>

					{/* Activités Récentes et Répartition Géographique */}
					<Grid gutter="lg">
						<Grid.Col span={{ base: 12, lg: 4 }}>
							<ActivityTimeline activities={data.recentActivities || data.metrics?.recentActivities || []} />
						</Grid.Col>
						<Grid.Col span={{ base: 12, lg: 8 }}>
							<Card p="xl" radius="lg" withBorder h="100%" style={{ background: 'white' }}>
								{data.geoData && data.geoData.length > 0 ? (
									<>
										<div style={{ height: '400px', width: '100%' }}>
											<GeoDistributionChart
												data={data.geoData}
												title="Répartition des participants par pays"
											/>
										</div>
									</>
								) : (
									<Text c="dimmed" ta="center" py="xl">
										Aucune donnée géographique disponible
									</Text>
								)}
							</Card>
						</Grid.Col>
					</Grid>
				</Stack>
			</PageContainer >
		</>
	);
};

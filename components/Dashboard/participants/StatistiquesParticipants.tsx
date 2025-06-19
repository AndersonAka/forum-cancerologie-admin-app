import { Card, Group, Box, Text, Skeleton } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";

interface StatistiquesParticipantsProps {
	total: number;
	totalEnLigne: number;
	totalPresentiel: number;
	loading?: boolean;
}

export default function StatistiquesParticipants({ total, totalEnLigne, totalPresentiel, loading }: StatistiquesParticipantsProps) {
	if (loading) {
		return (
			<Group mb="md" gap="md" grow>
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} height={110} radius="md" style={{ minWidth: 180 }} />
				))}
			</Group>
		);
	}

	return (
		<Group mb="md" gap="md" grow>
			<Card shadow="sm" radius="md" p="lg" withBorder style={{ minWidth: 180, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
				<Group gap="xs" align="center">
					<Box style={{ background: '#6366f1', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<IconUsers size={22} color="white" />
					</Box>
					<Text fw={700} size="xl">{total}</Text>
				</Group>
				<Text size="sm" c="dimmed" mt={4}>Total participants</Text>
			</Card>
			<Card shadow="sm" radius="md" p="lg" withBorder style={{ minWidth: 180, background: 'linear-gradient(135deg, #f0fdfa 0%, #99f6e4 100%)' }}>
				<Group gap="xs" align="center">
					<Box style={{ background: '#14b8a6', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<IconUsers size={22} color="white" />
					</Box>
					<Text fw={700} size="xl" c="teal.7">{totalEnLigne}</Text>
				</Group>
				<Text size="sm" c="teal.7" mt={4}>En ligne</Text>
			</Card>
			<Card shadow="sm" radius="md" p="lg" withBorder style={{ minWidth: 180, background: 'linear-gradient(135deg, #f0f4ff 0%, #c7d2fe 100%)' }}>
				<Group gap="xs" align="center">
					<Box style={{ background: '#6366f1', borderRadius: 8, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<IconUsers size={22} color="white" />
					</Box>
					<Text fw={700} size="xl" c="indigo.7">{totalPresentiel}</Text>
				</Group>
				<Text size="sm" c="indigo.7" mt={4}>En présentiel</Text>
			</Card>
		</Group>
	);
}

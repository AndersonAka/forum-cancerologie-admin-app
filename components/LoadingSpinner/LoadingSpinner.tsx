import { Group, Loader, Text, Skeleton, Stack, Card, Box } from "@mantine/core";

interface LoadingSpinnerProps {
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	height?: number | string;
	message?: string;
	centered?: boolean;
}

export const LoadingSpinner = ({
	size = "xl",
	height = 400,
	message = "Chargement...",
	centered = true
}: LoadingSpinnerProps) => {
	return (
		<Group
			justify={centered ? "center" : "flex-start"}
			align="center"
			h={height}
			style={{ width: "100%" }}
		>
			<Group gap="md" justify="center" align="center" h={400} >
				<Loader size={size} />
				{message && (
					<Text size="sm" c="dimmed">
						{message}
					</Text>
				)}
			</Group>
		</Group>
	);
};

export function DashboardSkeleton() {
	return (
		<Stack gap="lg" p="md">
			{/* Skeletons pour les cards de statistiques */}
			<Group gap="md" grow>
				{[1, 2, 3].map((i) => (
					<Card key={i} shadow="sm" radius="md" p="lg" withBorder style={{ minWidth: 180 }}>
						<Group gap="xs" align="center">
							<Skeleton height={32} width={32} radius={8} />
							<Skeleton height={28} width={60} />
						</Group>
						<Skeleton height={16} width={100} mt={8} />
					</Card>
				))}
			</Group>
			{/* Skeletons pour les graphiques ou widgets */}
			<Group gap="md" grow>
				<Card shadow="sm" radius="md" p="lg" withBorder style={{ minWidth: 300, flex: 1 }}>
					<Skeleton height={180} radius="md" />
				</Card>
				<Card shadow="sm" radius="md" p="lg" withBorder style={{ minWidth: 300, flex: 1 }}>
					<Skeleton height={180} radius="md" />
				</Card>
			</Group>
			{/* Skeleton pour le tableau principal */}
			<Card shadow="sm" radius="md" p="lg" withBorder>
				<Skeleton height={40} width={200} mb={16} />
				<Skeleton height={32} width="100%" mb={8} />
				<Skeleton height={32} width="100%" mb={8} />
				<Skeleton height={32} width="100%" mb={8} />
				<Skeleton height={32} width="100%" mb={8} />
				<Skeleton height={32} width="100%" mb={8} />
			</Card>
		</Stack>
	);
}

export default LoadingSpinner;

import { Paper, Text, Group } from "@mantine/core";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityChartProps {
	data: {
		date: string;
		visits?: number;
		count?: number;
	}[];
	title: string;
}

export const ActivityChart = ({ data, title }: ActivityChartProps) => {
	// Normaliser les données pour utiliser 'visits' ou 'count'
	const normalizedData = data.map(item => ({
		date: item.date,
		visits: item.visits || item.count || 0
	}));

	return (
		<Paper p="md" radius="md" withBorder>
			<Group mb="md">
				<Text fw={700} size="lg">
					{title}
				</Text>
			</Group>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={normalizedData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="date" />
						<YAxis />
						<Tooltip />
						<Line
							type="monotone"
							dataKey="visits"
							stroke="#2563eb"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</Paper>
	);
};

import { Paper, Text, Group } from "@mantine/core";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityChartProps {
	data: {
		date: string;
		visits: number;
	}[];
	title: string;
}

export const ActivityChart = ({ data, title }: ActivityChartProps) => {
	return (
		<Paper p="md" radius="md" withBorder>
			<Group mb="md">
				<Text fw={700} size="lg">
					{title}
				</Text>
			</Group>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<LineChart data={data}>
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

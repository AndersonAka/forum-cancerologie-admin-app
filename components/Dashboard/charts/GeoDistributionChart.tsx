import { Text } from "@mantine/core";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GeoDistributionChartProps {
	data: {
		country: string;
		users: number;
	}[];
	title: string;
}

export const GeoDistributionChart = ({ data, title }: GeoDistributionChartProps) => {
	return (
		<div className="h-[400px]">
			<Text fw={700} size="lg" mb="md">
				{title}
			</Text>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{
						top: 20,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="country" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="users" fill="#228be6" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

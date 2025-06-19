import { Text, SegmentedControl, Box, Button, Group } from "@mantine/core";
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
	PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { useState, useRef } from "react";
import { IconDownload, IconFileSpreadsheet } from "@tabler/icons-react";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

interface GeoDistributionChartProps {
	data: {
		country: string;
		users: number;
	}[];
	title: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const GeoDistributionChart = ({ data, title }: GeoDistributionChartProps) => {
	const [chartType, setChartType] = useState<string>('bar');
	const chartRef = useRef<HTMLDivElement>(null);

	const exportToPNG = async () => {
		if (chartRef.current) {
			try {
				const canvas = await html2canvas(chartRef.current, {
					background: '#ffffff',
					useCORS: true,
					allowTaint: true,
				});

				const link = document.createElement('a');
				link.download = `distribution-geographique-${chartType}-${new Date().toISOString().split('T')[0]}.png`;
				link.href = canvas.toDataURL('image/png');
				link.click();
			} catch (error) {
				console.error('Erreur lors de l\'export:', error);
			}
		}
	};

	const exportToExcel = () => {
		try {
			// Calculer les pourcentages
			const totalUsers = data.reduce((sum, item) => sum + item.users, 0);

			// Préparer les données pour l'export
			const exportData = data.map(item => {
				const percentage = ((item.users / totalUsers) * 100).toFixed(2);
				return {
					Pays: item.country,
					"Nombre d'utilisateurs": item.users,
					"Pourcentage (%)": parseFloat(percentage),
					"Pourcentage formaté": `${percentage}%`
				};
			});

			// Ajouter une ligne de total
			exportData.push({
				Pays: "TOTAL",
				"Nombre d'utilisateurs": totalUsers,
				"Pourcentage (%)": 100,
				"Pourcentage formaté": "100%"
			});

			// Créer le workbook et worksheet
			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();

			// Ajouter le worksheet au workbook
			XLSX.utils.book_append_sheet(wb, ws, "Distribution Géographique");

			// Générer le nom de fichier avec la date
			const fileName = `distribution-geographique-${new Date().toISOString().split('T')[0]}.xlsx`;

			// Télécharger le fichier
			XLSX.writeFile(wb, fileName);
		} catch (error) {
			console.error('Erreur lors de l\'export Excel:', error);
		}
	};

	const renderChart = () => {
		switch (chartType) {
			case 'bar':
				return (
					<BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="country" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="users" fill="#228be6" />
					</BarChart>
				);

			case 'pie':
				return (
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
							outerRadius={80}
							fill="#8884d8"
							dataKey="users"
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip />
					</PieChart>
				);

			case 'line':
				return (
					<LineChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="country" />
						<YAxis />
						<Tooltip />
						<Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
					</LineChart>
				);

			case 'area':
				return (
					<AreaChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="country" />
						<YAxis />
						<Tooltip />
						<Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
					</AreaChart>
				);

			default:
				return (
					<BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="country" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="users" fill="#228be6" />
					</BarChart>
				);
		}
	};

	return (
		<div style={{ width: "100%", height: "100%" }}>
			<Box mb="md">
				<Text fw={700} size="lg" mb="md">
					{title}
				</Text>
				<Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<SegmentedControl
						data={[
							{ label: 'Barres', value: 'bar' },
							{ label: 'Camembert', value: 'pie' },
							{ label: 'Ligne', value: 'line' },
							{ label: 'Aire', value: 'area' },
						]}
						value={chartType}
						onChange={setChartType}
						size="sm"
					/>
					<Group gap="xs">
						<Button
							onClick={exportToPNG}
							leftSection={<IconDownload size={16} />}
							size="sm"
							variant="light"
						>
							PNG
						</Button>
						<Button
							onClick={exportToExcel}
							leftSection={<IconFileSpreadsheet size={16} />}
							size="sm"
							variant="light"
							color="green"
						>
							Excel
						</Button>
					</Group>
				</Box>
			</Box>
			<div ref={chartRef} style={{ width: "100%", height: "calc(100% - 120px)" }}>
				<ResponsiveContainer width="100%" height="100%">
					{renderChart()}
				</ResponsiveContainer>
			</div>
		</div>
	);
};

// Export par défaut pour l'import dynamique
export default GeoDistributionChart;

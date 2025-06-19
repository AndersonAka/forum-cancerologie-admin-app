"use client"
import { Button, Group, TextInput, Flex, Title, Tooltip, ActionIcon, Box, Text, Card, Skeleton } from "@mantine/core";
import { IconX, IconFilter } from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface DateFilterProps {
	dateFrom: string;
	dateTo: string;
	onDateFromChange: (value: string) => void;
	onDateToChange: (value: string) => void;
	onReset: () => void;
	title?: string;
	description?: string;
	showExportButtons?: boolean;
	onExportExcel?: () => void;
	onExportPDF?: () => void;
	loading?: boolean;
}

export const DateFilter = ({
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
	onReset,
	title = "Filtre de date",
	description = "Afficher les données sur une période donnée",
	showExportButtons = false,
	onExportExcel,
	onExportPDF,
	loading = false
}: DateFilterProps) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Options rapides
	const setCurrentMonth = () => {
		const now = new Date();
		const first = new Date(now.getFullYear(), now.getMonth(), 1);
		const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		onDateFromChange(first.toISOString().slice(0, 10));
		onDateToChange(last.toISOString().slice(0, 10));
	};

	const setLastMonth = () => {
		const now = new Date();
		const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const last = new Date(now.getFullYear(), now.getMonth(), 0);
		onDateFromChange(first.toISOString().slice(0, 10));
		onDateToChange(last.toISOString().slice(0, 10));
	};

	if (loading) {
		return (
			<Card
				p="xl"
				radius="lg"
				withBorder
				shadow="sm"
				mb="xl"
				style={{
					background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
					border: '1px solid #e2e8f0',
				}}
			>
				<Flex direction="row" gap="xs" mb="lg" align="center">
					<Skeleton height={48} width={48} radius={12} />
					<Box>
						<Skeleton height={20} width={150} mb={4} />
						<Skeleton height={16} width={200} />
					</Box>
				</Flex>

				<Flex
					direction={{ base: 'column', sm: 'row' }}
					gap={{ base: 'md', sm: 'lg' }}
					justify={{ sm: 'space-between' }}
					align={{ sm: 'flex-end' }}
				>
					<Flex
						direction={{ base: 'column', sm: 'row' }}
						gap={{ base: 'md', sm: 'lg' }}
						justify={{ sm: 'flex-start' }}
						align={{ sm: 'flex-end' }}
						style={{ flex: 1 }}
					>
						<Skeleton height={60} width={140} />
						<Skeleton height={60} width={140} />
						<Group gap="xs" align="flex-end">
							<Skeleton height={32} width={100} />
							<Skeleton height={32} width={100} />
							<Skeleton height={32} width={32} />
						</Group>
					</Flex>

					{showExportButtons && (
						<Group gap="xs">
							<Skeleton height={32} width={120} />
							<Skeleton height={32} width={120} />
						</Group>
					)}
				</Flex>
			</Card>
		);
	}

	return (
		<Card
			p="xl"
			radius="lg"
			withBorder
			shadow="sm"
			mb="xl"
			style={{
				background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
				border: '1px solid #e2e8f0',
				opacity: mounted ? 1 : 0,
				transform: mounted ? 'translateY(0)' : 'translateY(20px)',
				transition: 'opacity 0.4s ease, transform 0.4s ease',
			}}
		>
			<Flex direction="row" gap="xs" mb="lg" align="center">
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
					<IconFilter size={24} color="white" />
				</Box>
				<Box>
					<Title order={5} fw={700}>{title}</Title>
					<Text size="sm" c="dimmed">{description}</Text>
				</Box>
			</Flex>

			<Flex
				direction={{ base: 'column', sm: 'row' }}
				gap={{ base: 'md', sm: 'lg' }}
				justify={{ sm: 'space-between' }}
				align={{ sm: 'flex-end' }}
			>
				<Flex
					direction={{ base: 'column', sm: 'row' }}
					gap={{ base: 'md', sm: 'lg' }}
					justify={{ sm: 'flex-start' }}
					align={{ sm: 'flex-end' }}
					style={{ flex: 1 }}
				>
					<TextInput
						type="date"
						label="Du"
						id="date-from"
						value={dateFrom}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDateFromChange(e.target.value)}
						size="sm"
						radius="md"
						styles={{
							input: {
								border: '1px solid #e2e8f0',
								'&:focus': {
									borderColor: '#3b82f6',
									boxShadow: '0 0 0 1px #3b82f6',
								}
							}
						}}
					/>
					<TextInput
						type="date"
						label="Au"
						id="date-to"
						value={dateTo}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDateToChange(e.target.value)}
						size="sm"
						radius="md"
						styles={{
							input: {
								border: '1px solid #e2e8f0',
								'&:focus': {
									borderColor: '#3b82f6',
									boxShadow: '0 0 0 1px #3b82f6',
								}
							}
						}}
					/>
					<Group gap="xs" align="flex-end">
						<Tooltip label="Mois en cours">
							<Button
								type="button"
								onClick={setCurrentMonth}
								size="sm"
								variant="outline"
								radius="md"
								styles={{
									root: {
										borderColor: '#3b82f6',
										color: '#3b82f6',
										'&:hover': {
											backgroundColor: '#3b82f6',
											color: 'white',
										}
									}
								}}
							>
								Mois courant
							</Button>
						</Tooltip>

						<Tooltip label="Mois passé">
							<Button
								type="button"
								onClick={setLastMonth}
								size="sm"
								variant="light"
								radius="md"
								color="blue"
							>
								Mois passé
							</Button>
						</Tooltip>
						{(dateFrom || dateTo) && (
							<Tooltip label="Réinitialiser le filtre">
								<ActionIcon
									color="gray"
									variant="filled"
									size="md"
									radius="md"
									onClick={onReset}
									styles={{
										root: {
											backgroundColor: '#ef4444',
											color: 'white',
											'&:hover': {
												backgroundColor: '#dc2626',
											}
										}
									}}
								>
									<IconX size={18} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				</Flex>

				{showExportButtons && dateFrom && dateTo && onExportExcel && onExportPDF && (
					<Group gap="xs">
						<Button
							onClick={onExportExcel}
							color="teal"
							variant="light"
							size="sm"
							radius="md"
							styles={{
								root: {
									background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
									color: 'white',
									'&:hover': {
										background: 'linear-gradient(135deg, #0f766e 0%, #0d5a52 100%)',
									}
								}
							}}
						>
							Exporter Excel
						</Button>
						<Button
							onClick={onExportPDF}
							color="red"
							variant="light"
							size="sm"
							radius="md"
							styles={{
								root: {
									background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
									color: 'white',
									'&:hover': {
										background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
									}
								}
							}}
						>
							Exporter PDF
						</Button>
					</Group>
				)}
			</Flex>
		</Card>
	);
};

export default DateFilter;

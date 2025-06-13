"use client";

import { ActionIcon, Button, Group, Paper, Title, Tooltip } from "@mantine/core";
import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { type MRT_PaginationState, type MRT_SortingState } from "mantine-react-table";

interface SimpleTableProps<T extends Record<string, any>> {
	title?: string;
	columns: MRT_ColumnDef<T>[];
	data: T[];
	onAdd?: () => void;
	addButtonLabel?: string;
	enableRowActions?: boolean;
	onEdit?: (row: T) => void;
	onDelete?: (row: T) => void;
	state?: {
		pagination: MRT_PaginationState;
		sorting: MRT_SortingState;
		isLoading?: boolean;
	};
	onPaginationChange?: (updaterOrValue: MRT_PaginationState | ((old: MRT_PaginationState) => MRT_PaginationState)) => void;
	onSortingChange?: (updaterOrValue: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState)) => void;
	rowCount?: number;
	enablePagination?: boolean;
	enableSorting?: boolean;
}

export function SimpleTable<T extends Record<string, any>>({
	title = "Liste",
	columns,
	data,
	onAdd,
	addButtonLabel = "Ajouter",
	enableRowActions = false,
	onEdit,
	onDelete,
	state,
	onPaginationChange,
	onSortingChange,
	rowCount,
	enablePagination,
	enableSorting,
}: SimpleTableProps<T>) {
	const tableColumns = useMemo<MRT_ColumnDef<T>[]>(() => {
		const baseColumns = [...columns];

		if (enableRowActions) {
			baseColumns.push({
				id: "actions",
				header: "Actions",
				enableSorting: false,
				enableColumnFilter: false,
				enableGlobalFilter: false,
				Cell: ({ row }) => {
					const handleEdit = () => {
						if (onEdit) {
							onEdit(row.original);
						}
					};

					const handleDelete = () => {
						if (onDelete) {
							onDelete(row.original);
						}
					};

					return (
						<Group gap="xs" justify="center">
							{onEdit && (
								<Tooltip label="Modifier">
									<ActionIcon
										variant="light"
										color="blue"
										onClick={handleEdit}
										size="md"
									>
										<IconEdit size={18} />
									</ActionIcon>
								</Tooltip>
							)}
							{onDelete && (
								<Tooltip label="Supprimer">
									<ActionIcon
										variant="light"
										color="red"
										onClick={handleDelete}
										size="md"
									>
										<IconTrash size={18} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					);
				},
			});
		}

		return baseColumns;
	}, [columns, enableRowActions, onEdit, onDelete]);

	const handleAdd = () => {
		if (onAdd) {
			onAdd();
		}
	};

	return (
		<Paper withBorder radius="md" p="md">
			<Group justify="space-between" mb="md">
				<Title order={5}>{title}</Title>
				{onAdd && (
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={handleAdd}
						size="xs"
					>
						{addButtonLabel}
					</Button>
				)}
			</Group>
			<MantineReactTable
				columns={tableColumns}
				data={data}
				mantinePaperProps={{ shadow: "0", withBorder: false }}
				enableRowActions={enableRowActions}
				enableRowSelection={false}
				enableColumnFilters={true}
				enableSorting={enableSorting}
				enablePagination={enablePagination}
				state={state}
				onPaginationChange={onPaginationChange}
				onSortingChange={onSortingChange}
				rowCount={rowCount}
				mantineTableHeadCellProps={{
					style: {
						fontWeight: "bold",
					},
				}}
			/>
		</Paper>
	);
}

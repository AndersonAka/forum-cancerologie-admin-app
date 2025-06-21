"use client";

import { ActionIcon, Button, Group, Paper, Title, Tooltip, Box, Stack, Flex, Text } from "@mantine/core";
import { type MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { useMemo, useState } from "react";
import { IconPlus, IconEdit, IconTrash, IconFileSpreadsheet, IconFileTypePdf, IconX, IconPhoto, IconDownload, IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { type MRT_PaginationState, type MRT_SortingState } from "mantine-react-table";
import { DatePickerInput } from '@mantine/dates';
import { TextInput } from '@mantine/core';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthPicker } from '@mantine/dates';

interface SimpleTableProps<T extends Record<string, any>> {
	title?: string | React.ReactNode;
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
		rowSelection?: any;
	};
	onPaginationChange?: (updaterOrValue: MRT_PaginationState | ((old: MRT_PaginationState) => MRT_PaginationState)) => void;
	onSortingChange?: (updaterOrValue: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState)) => void;
	rowCount?: number;
	enablePagination?: boolean;
	enableSorting?: boolean;
	enableExport?: boolean;
	exportFileName?: string;
	exportTransform?: (row: T) => Record<string, any>;
	onExportExcel?: () => void;
	onExportPDF?: () => void;
	filterPeriodText?: string;
	rowSelection?: any;
	onRowSelectionChange?: (updaterOrValue: any) => void;
	enableRowSelection?: boolean;
	/** Active l'affichage d'une colonne de numérotation automatique (#) */
	enableRowNumbers?: boolean;
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
	enableExport = false,
	exportFileName = 'export',
	exportTransform,
	onExportExcel,
	onExportPDF,
	filterPeriodText,
	rowSelection,
	onRowSelectionChange,
	enableRowSelection = true,
	enableRowNumbers = false,
}: SimpleTableProps<T>) {
	const tableColumns = useMemo<MRT_ColumnDef<T>[]>(() => {
		const baseColumns = [...columns];
		if (enableRowNumbers) {
			baseColumns.unshift({
				id: "row-number",
				header: "#",
				size: 60,
				Cell: ({ row, table }: { row: any; table: any }) => {
					// Calculer le numéro en tenant compte de la pagination
					const pageIndex = table.getState().pagination.pageIndex;
					const pageSize = table.getState().pagination.pageSize;
					const rowNumber = pageIndex * pageSize + row.index + 1;
					return rowNumber;
				},
			});
		}
		return baseColumns;
	}, [columns, enableRowActions, onEdit, onDelete, enableRowNumbers]);

	const handleAdd = () => {
		if (onAdd) {
			onAdd();
		}
	};

	// Export Excel
	const handleExportExcel = () => {
		if (onExportExcel) {
			onExportExcel();
		} else {
			const exportData = (exportTransform ? data.map(exportTransform) : data);
			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, exportFileName);
			XLSX.writeFile(wb, `${exportFileName}.xlsx`);
		}
	};

	// Export PDF
	const handleExportPDF = () => {
		if (onExportPDF) {
			onExportPDF();
		} else {
			const exportData = (exportTransform ? data.map(exportTransform) : data);
			const doc = new jsPDF();
			const columns = exportData.length > 0 ? Object.keys(exportData[0]) : [];
			const rows = exportData.map((row) => columns.map((col) => row[col]));
			autoTable(doc, {
				head: [columns],
				body: rows,
				startY: 20,
				styles: { fontSize: 8 },
			});
			doc.save(`${exportFileName}.pdf`);
		}
	};

	const tableState = { ...state };
	if (rowSelection !== undefined) {
		tableState.rowSelection = rowSelection;
	}

	return (
		<Paper withBorder radius="md" p="md">
			<MantineReactTable
				columns={tableColumns}
				data={data}
				mantinePaperProps={{ shadow: "0", withBorder: false }}
				enableRowActions={enableRowActions}
				enableRowSelection={enableRowSelection}
				enableColumnFilters={true}
				enableSorting={enableSorting}
				enablePagination={enablePagination}
				positionActionsColumn="last"
				state={tableState as any}
				onPaginationChange={onPaginationChange}
				onSortingChange={onSortingChange}
				{...(onRowSelectionChange ? { onRowSelectionChange } : {})}
				rowCount={rowCount}
				manualPagination={true}
				mantineTableHeadCellProps={{
					style: {
						fontWeight: "bold",
					},
				}}
				{...(enableRowActions && (onEdit || onDelete)
					? {
						renderRowActions: ({ row }: any) => (
							<Group gap="xs" justify="center">
								{onEdit && (
									<Tooltip label="Modifier">
										<ActionIcon
											variant="light"
											color="blue"
											onClick={() => onEdit(row.original)}
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
											onClick={() => onDelete(row.original)}
											size="md"
										>
											<IconTrash size={18} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						),
					}
					: {})}
			/>
		</Paper >
	);
}

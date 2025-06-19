"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "components/PageContainer/PageContainer";
import { SimpleTable } from "components/Table/SimpleTable";
import { notifications } from "@mantine/notifications";
import { Button, Group, Pagination, TextInput, Flex, Title, Tooltip, ActionIcon, Box, Text, Card, Modal, Progress, Loader } from "@mantine/core";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MRT_PaginationState, MRT_RowSelectionState } from "mantine-react-table";
import ParticipantDetailModal from "./ParticipantDetailModal";
import { IconFileSpreadsheet, IconFileTypePdf, IconX, IconInfoCircle, IconMoodSmile, IconUsers, IconEye, IconCertificate } from "@tabler/icons-react";
import DateFilter from "components/DateFilter/DateFilter";
import TitrePage from "components/TitrePage/TitrePage";
import StatistiquesParticipants from "./StatistiquesParticipants";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";

interface Participant {
	id: number;
	email: string;
	title?: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	country?: string;
	specialty?: string;
	createdAt?: string;
	pageVisits?: any[];
	videoWatches?: any[];
	userJourney?: any[];
	participationMode?: string;
}

export default function ParticipantPage() {

	const [participants, setParticipants] = useState<Participant[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 });
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selected, setSelected] = useState<Participant | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [dateFrom, setDateFrom] = useState<string>("");
	const [dateTo, setDateTo] = useState<string>("");
	const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
	const [exporting, setExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);
	const [exportTotal, setExportTotal] = useState(0);
	const [exportCurrentName, setExportCurrentName] = useState<string | null>(null);
	const [exportError, setExportError] = useState<string | null>(null);

	useEffect(() => {
		const fetchParticipants = async () => {
			try {
				setLoading(true);
				// Utiliser /api/users pour récupérer tous les utilisateurs, puis filtrer les participants (rôle USER)
				// Note: /api/users/admins est utilisé pour les utilisateurs système (SPADMIN, ADMIN, MANAGER)
				const response = await fetch("/api/users");
				if (!response.ok) {
					throw new Error("Erreur lors du chargement des participants");
				}
				const data = await response.json();
				// Filtrer les utilisateurs avec le rôle USER (participants uniquement)
				const users = data.users.filter((u: any) => u.role === "USER");
				setParticipants(users);
			} catch (error) {
				notifications.show({
					title: "Erreur",
					message: "Erreur lors du chargement des participants",
					color: "red",
				});
			} finally {
				setLoading(false);
			}
		};
		fetchParticipants();
	}, []);

	const columns = [
		{ header: "Titre", accessorFn: (row: Participant) => (row.title || "").toUpperCase() },
		{ header: "Nom et prénoms", accessorFn: (row: Participant) => `${row.firstName || ""} ${row.lastName || ""}`.trim().toUpperCase() },
		{ header: "Email", accessorFn: (row: Participant) => (row.email || "").toLowerCase() },
		{ header: "Téléphone", accessorFn: (row: Participant) => (row.phoneNumber || "").toUpperCase() },
		{ header: "Pays", accessorFn: (row: Participant) => (row.country || "").toUpperCase() },
		{ header: "Spécialité", accessorFn: (row: Participant) => (row.specialty || "").toUpperCase() },
		{
			header: "Mode de participation", accessorFn: (row: Participant) => {
				if (row.participationMode) {
					return row.participationMode.toUpperCase();
				}
				if (row.userJourney?.some((uj: any) => uj.type === 'online')) {
					return "EN LIGNE";
				} else if (row.userJourney?.some((uj: any) => uj.type === 'onsite')) {
					return "EN PRÉSENTIEL";
				} else {
					return "MIXTE";
				}
			}
		},
		{ header: "Vidéos vues", accessorFn: (row: any) => row.videoWatches?.length ?? 0 },
		{
			header: "Dernière activité", accessorFn: (row: any) => {
				if (!row.userJourney?.length) return "-";
				const last = row.userJourney.reduce((a: any, b: any) =>
					new Date(a.timestamp) > new Date(b.timestamp) ? a : b
				);
				return new Date(last.timestamp).toLocaleString();
			}
		},
		{
			header: "Détail",
			accessorFn: (row: Participant) => row.id,
			Cell: ({ row }: { row: { original: Participant } }) => {
				const participant = row.original;
				const handleConsentPDF = () => {
					const doc = new jsPDF();
					const img = new window.Image();
					img.src = "/logo-forum-cancer.png";
					img.onload = () => {
						// Logo centré
						doc.addImage(img, "PNG", 90, 10, 25, 20);
						doc.setFontSize(18);
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Formulaire de consentement', 105, 38, { align: 'center' });
						doc.setDrawColor(0, 63, 155);
						doc.setLineWidth(0.5);
						doc.line(20, 44, 190, 44);

						// Section infos participant (une info par ligne)
						let y = 54;
						doc.setFontSize(12);
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Informations participant-e :', 20, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.text('Titre :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.title?.toUpperCase() || '-', 50, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Nom :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.lastName?.toUpperCase() || '-', 50, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Spécialité :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.specialty?.toUpperCase() || '-', 50, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Pays :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.country?.toUpperCase() || '-', 50, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Téléphone :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.phoneNumber || '-', 50, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Email :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.email || '-', 50, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Mode de participation :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						const mode = participant.participationMode
							? participant.participationMode.toUpperCase()
							: (participant.userJourney?.some((uj: any) => uj.type === 'en ligne') ? "EN LIGNE" : participant.userJourney?.some((uj: any) => uj.type === 'présentiel') ? "EN PRÉSENTIEL" : "MIXTE");
						doc.text(mode, 80, y);
						y += 8;
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Date inscription :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setTextColor(0, 0, 0);
						doc.text(participant.createdAt ? new Date(participant.createdAt).toLocaleDateString('fr-FR') : '-', 60, y);

						// Section consentement
						y += 14;
						doc.setFont('helvetica', 'bold');
						doc.setFontSize(12);
						doc.setTextColor(0, 63, 155);
						doc.text('Vous consentez à :', 20, y);
						doc.setFont('helvetica', 'normal');
						doc.setFontSize(11);
						doc.setTextColor(0, 0, 0);
						const consentList = [
							"1- Autoriser ROCHE à vous partager des informations sur ses produits, services et des données scientifiques par des canaux digitaux.",
							"2- Recevoir des communications régulières concernant les aires thérapeutiques de roche.",
							"3- L'utilisation de vos informations professionnelles dans le respect des normes éthiques et légales.",
							"4- La possibilité de retirer votre consentement à tout moment, sans conséquence."
						];
						let cy = y + 8;
						consentList.forEach((item, idx) => {
							const lines = doc.splitTextToSize(item, 165);
							doc.text(lines, 25, cy);
							cy += lines.length * 7;
						});

						// Date d'export et logo pied de page
						doc.setFontSize(9);
						doc.setFont('helvetica', 'italic');
						doc.setTextColor(100, 100, 100);
						const exportDate = new Date().toLocaleDateString('fr-FR', {
							day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
						});
						doc.text(`Document généré le ${exportDate}`, 20, 285);
						doc.addImage(img, "PNG", 170, 278, 15, 12);

						// Section signature en bas à droite
						doc.setFontSize(12);
						doc.setFont('helvetica', 'bold');
						doc.setTextColor(0, 63, 155);
						doc.text('Signature :', 160, 265);

						doc.save(`FICHE_CONSENTEMENT_${participant.firstName || ''}_${participant.lastName || ''}.pdf`);
					};
					img.onerror = () => { alert("Erreur de chargement du logo !"); };
				};
				return (
					<Group gap={5}>
						<Tooltip label="Voir détail" withArrow>
							<Button size="xs" variant="outline" onClick={() => { setSelected(row.original); setModalOpen(true); }}>
								<IconEye size={15} />
							</Button>
						</Tooltip>
						<Tooltip label="Fiche consentement" withArrow>
							<Button size="xs" variant="outline" color="red" onClick={handleConsentPDF}>
								<IconCertificate size={15} />
							</Button>
						</Tooltip>
					</Group>
				);
			},
		},
	];

	// Filtrage par plage de dates
	const filteredParticipants = participants.filter((participant) => {
		if (!dateFrom || !dateTo) return true;
		if (!participant.userJourney?.length) return false;

		const from = new Date(dateFrom);
		const to = new Date(dateTo);
		to.setHours(23, 59, 59, 999); // Fin de journée

		return participant.userJourney.some((uj) => {
			if (!uj.timestamp) return false;
			const activityDate = new Date(uj.timestamp);
			return activityDate >= from && activityDate <= to;
		});
	});

	const handleExportExcel = () => {
		const exportData = filteredParticipants.map((row) => ({
			Titre: row.title || "",
			"Nom et prénoms": `${row.firstName || ""} ${row.lastName || ""}`.trim(),
			Email: row.email,
			Téléphone: row.phoneNumber || "",
			Pays: row.country || "",
			Spécialité: row.specialty || "",
			"Mode de participation": (() => {
				if (row.userJourney?.some((uj: any) => uj.type === 'en ligne')) {
					return "EN LIGNE";
				} else if (row.userJourney?.some((uj: any) => uj.type === 'présentiel')) {
					return "EN PRÉSENTIEL";
				} else {
					return "MIXTE";
				}
			})(),
			"Vidéos vues": row.videoWatches?.length ?? 0,
			"Dernière activité": row.userJourney?.length
				? new Date(row.userJourney.reduce((a: any, b: any) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b).timestamp).toLocaleString()
				: "-",
		}));
		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Participants");
		XLSX.writeFile(wb, "participants.xlsx");
	};

	const handleExportPDF = () => {
		const doc = new jsPDF();

		const img = new window.Image();
		img.src = "/logo-forum-cancer.png"; // Chemin relatif à /public

		img.onload = () => {
			// Logo en haut à droite (dimensions ajustées pour éviter l'étirement)
			doc.addImage(img, "PNG", 160, 10, 25, 20);

			// Titre principal (bleu, grand)
			doc.setFontSize(20);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text('Forum de Cancérologie de ROCHE', 14, 20);

			// Sous-titre (noir, plus petit)
			doc.setFontSize(13);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(0, 0, 0);
			doc.text('Liste des Participants', 14, 28);

			// Ligne de séparation
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.5);
			doc.line(14, 32, 196, 32);

			// Période de filtre si applicable
			const filterText = getFilterPeriodText();
			if (filterText) {
				doc.setFontSize(11);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Période :', 14, 40);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(filterText, 14, 46);
			}

			// Date d'export et total participants
			doc.setFontSize(9);
			doc.setFont('helvetica', 'italic');
			doc.setTextColor(100, 100, 100);
			const exportDate = new Date().toLocaleDateString('fr-FR', {
				day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
			});
			doc.text(`Document généré le ${exportDate}`, 14, filterText ? 54 : 40);

			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text(`Total participants : ${filteredParticipants.length}`, 14, filterText ? 62 : 48);

			// Tableau
			const tableColumn = [
				"Titre", "Nom et prénoms", "Email", "Téléphone", "Pays", "Spécialité",
				"Mode de participation", "Vidéos vues", "Dernière activité"
			];
			const tableRows = filteredParticipants.map((row) => [
				row.title || "",
				`${row.firstName || ""} ${row.lastName || ""}`.trim(),
				row.email,
				row.phoneNumber || "",
				row.country || "",
				row.specialty || "",
				(() => {
					if (row.userJourney?.some((uj: any) => uj.type === 'online')) {
						return "EN LIGNE";
					} else if (row.userJourney?.some((uj: any) => uj.type === 'onsite')) {
						return "EN PRÉSENTIEL";
					} else {
						return "MIXTE";
					}
				})(),
				row.videoWatches?.length ?? 0,
				row.userJourney?.length
					? new Date(row.userJourney.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b).timestamp).toLocaleString()
					: "-",
			]);

			// Position de départ du tableau ajustée selon le contenu
			const startY = filterText ? 70 : 56;

			autoTable(doc, {
				head: [tableColumn],
				body: tableRows,
				startY: startY,
				styles: { fontSize: 8 },
				headStyles: { fillColor: [0, 63, 155], textColor: 255, fontStyle: 'bold' },
				alternateRowStyles: { fillColor: [245, 248, 255] },
			});

			// Pagination et logo en pied de page (dimensions ajustées)
			const pageCount = doc.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(9);
				doc.text(`Page ${i} / ${pageCount}`, 14, doc.internal.pageSize.height - 10);
				doc.addImage(img, "PNG", 170, doc.internal.pageSize.height - 15, 15, 12);
			}

			doc.save("LISTE_DES_PARTICIPANTS.pdf");
		};

		img.onerror = () => {
			alert("Erreur de chargement du logo !");
		};
	};

	// Découpage des données pour la page courante
	const paginatedParticipants = filteredParticipants.slice(
		(page - 1) * pageSize,
		page * pageSize
	);

	// Génération du texte de période de filtre
	const getFilterPeriodText = () => {
		if (!dateFrom || !dateTo) return undefined;

		const fromDate = new Date(dateFrom);
		const toDate = new Date(dateTo);

		// Vérifier si c'est le mois courant
		const now = new Date();
		const currentMonthFirst = new Date(now.getFullYear(), now.getMonth(), 1);
		const currentMonthLast = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		if (fromDate.getTime() === currentMonthFirst.getTime() && toDate.getTime() === currentMonthLast.getTime()) {
			return `Mois de ${fromDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
		}

		// Vérifier si c'est le mois passé
		const lastMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthLast = new Date(now.getFullYear(), now.getMonth(), 0);

		if (fromDate.getTime() === lastMonthFirst.getTime() && toDate.getTime() === lastMonthLast.getTime()) {
			return `Mois de ${fromDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
		}

		// Période personnalisée
		const fromFormatted = fromDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
		const toFormatted = toDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

		return ` Du ${fromFormatted} au ${toFormatted}`;
	};

	const total = filteredParticipants.length;
	const totalEnLigne = filteredParticipants.filter(p => (p.participationMode?.toLowerCase() === 'en ligne') || (!p.participationMode && p.userJourney?.some((uj: any) => uj.type === 'online'))).length;
	const totalPresentiel = filteredParticipants.filter(p => (p.participationMode?.toLowerCase() === 'présentiel') || (!p.participationMode && p.userJourney?.some((uj: any) => uj.type === 'onsite'))).length;

	// Génération groupée des fiches de consentement
	const handleExportConsentGroup = async () => {
		const selected = Object.keys(rowSelection)
			.map(idx => filteredParticipants[parseInt(idx, 10)])
			.filter(Boolean);
		if (selected.length === 0) return;

		setExporting(true);
		setExportProgress(0);
		setExportTotal(selected.length);
		setExportCurrentName(null);
		setExportError(null);

		try {
			if (selected.length > 2) {
				// ZIP
				const zip = new JSZip();
				for (let i = 0; i < selected.length; i++) {
					const participant = selected[i];
					setExportCurrentName(`${participant.firstName || ''} ${participant.lastName || ''}`.trim());
					const pdfBlob = await generateConsentPDFBlob(participant);
					const fileName = `FICHE_CONSENTEMENT_${(participant.firstName || '').toUpperCase()}_${(participant.lastName || '').toUpperCase()}.pdf`;
					zip.file(fileName, pdfBlob);
					setExportProgress(i + 1);
				}
				const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
					// Optionnel : progression de la compression
				});
				saveAs(zipBlob, "fiches_consentement.zip");
			} else {
				// Téléchargement direct
				for (let i = 0; i < selected.length; i++) {
					const participant = selected[i];
					setExportCurrentName(`${participant.firstName || ''} ${participant.lastName || ''}`.trim());
					const pdfBlob = await generateConsentPDFBlob(participant);
					saveAs(pdfBlob, `FICHE_CONSENTEMENT_${(participant.firstName || '').toUpperCase()}_${(participant.lastName || '').toUpperCase()}.pdf`);
					setExportProgress(i + 1);
				}
			}
			setExporting(false);
			notifications.show({
				title: "Export terminé",
				message: "Les fiches de consentement ont été téléchargées.",
				color: "teal",
			});
		} catch (err: any) {
			setExportError("Erreur lors de la génération des PDF. Veuillez réessayer.");
			setExporting(false);
			notifications.show({
				title: "Erreur",
				message: "Une erreur est survenue lors de l'export.",
				color: "red",
			});
		}
	};

	async function generateConsentPDFBlob(participant: Participant): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const doc = new jsPDF();
			const img = new window.Image();
			img.src = "/logo-forum-cancer.png";
			img.onload = () => {
				// Logo centré
				doc.addImage(img, "PNG", 90, 10, 25, 20);
				doc.setFontSize(18);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Formulaire de consentement', 105, 38, { align: 'center' });
				doc.setDrawColor(0, 63, 155);
				doc.setLineWidth(0.5);
				doc.line(20, 44, 190, 44);

				// Section infos participant (une info par ligne)
				let y = 54;
				doc.setFontSize(12);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Informations participant-e :', 20, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.text('Titre :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.title?.toUpperCase() || '-', 50, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Nom :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.lastName?.toUpperCase() || '-', 50, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Spécialité :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.specialty?.toUpperCase() || '-', 50, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Pays :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.country?.toUpperCase() || '-', 50, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Téléphone :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.phoneNumber || '-', 50, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Email :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.email || '-', 50, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Mode de participation :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				const mode = participant.participationMode
					? participant.participationMode.toUpperCase()
					: (participant.userJourney?.some((uj: any) => uj.type === 'en ligne') ? "EN LIGNE" : participant.userJourney?.some((uj: any) => uj.type === 'présentiel') ? "EN PRÉSENTIEL" : "MIXTE");
				doc.text(mode, 80, y);
				y += 8;
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Date inscription :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0, 0, 0);
				doc.text(participant.createdAt ? new Date(participant.createdAt).toLocaleDateString('fr-FR') : '-', 60, y);

				// Section consentement
				y += 14;
				doc.setFont('helvetica', 'bold');
				doc.setFontSize(12);
				doc.setTextColor(0, 63, 155);
				doc.text('Vous consentez à :', 20, y);
				doc.setFont('helvetica', 'normal');
				doc.setFontSize(11);
				doc.setTextColor(0, 0, 0);
				const consentList = [
					"1- Autoriser ROCHE à vous partager des informations sur ses produits, services et des données scientifiques par des canaux digitaux.",
					"2- Recevoir des communications régulières concernant les aires thérapeutiques de roche.",
					"3- L'utilisation de vos informations professionnelles dans le respect des normes éthiques et légales.",
					"4- La possibilité de retirer votre consentement à tout moment, sans conséquence."
				];
				let cy = y + 8;
				consentList.forEach((item, idx) => {
					const lines = doc.splitTextToSize(item, 165);
					doc.text(lines, 25, cy);
					cy += lines.length * 7;
				});

				// Date d'export et logo pied de page
				doc.setFontSize(9);
				doc.setFont('helvetica', 'italic');
				doc.setTextColor(100, 100, 100);
				const exportDate = new Date().toLocaleDateString('fr-FR', {
					day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
				});
				doc.text(`Document généré le ${exportDate}`, 20, 285);
				doc.addImage(img, "PNG", 170, 278, 15, 12);

				// Section signature en bas à droite
				doc.setFontSize(12);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0, 63, 155);
				doc.text('Signature :', 160, 265);

				doc.output('blob') ? resolve(doc.output('blob')) : reject();
			};
			img.onerror = () => { reject(); };
		});
	}

	return (
		<PageContainer title={<TitrePage
			title="Liste des participants"
			subtitle="Liste des participants au forum de cancérologie de ROCHE"
			iconColor="#3b82f6"
		/>}>
			{/* Filtre de date */}
			<DateFilter
				dateFrom={dateFrom}
				dateTo={dateTo}
				onDateFromChange={setDateFrom}
				onDateToChange={setDateTo}
				onReset={() => { setDateFrom(""); setDateTo(""); }}
				title="Filtre des participants"
				description="Afficher la liste des participants sur une période donnée"
				showExportButtons={true}
				onExportExcel={handleExportExcel}
				onExportPDF={handleExportPDF}
				loading={loading}
			/>

			{/* Statistiques */}
			<StatistiquesParticipants total={total} totalEnLigne={totalEnLigne} totalPresentiel={totalPresentiel} loading={loading} />

			{Object.keys(rowSelection).length > 0 && (
				<Box mb="md">
					<Button color="red" variant="filled" size="sm" onClick={handleExportConsentGroup}>
						Générer les fiches de consentement sélectionnées
					</Button>
				</Box>
			)}
			<SimpleTable
				title="Participants"
				columns={columns}
				data={filteredParticipants}
				filterPeriodText={getFilterPeriodText()}
				enableExport
				exportFileName="participants"
				exportTransform={(row) => ({
					Titre: row.title || "",
					"Nom et prénoms": `${row.firstName || ""} ${row.lastName || ""}`.trim(),
					Email: row.email,
					Téléphone: row.phoneNumber || "",
					Pays: row.country || "",
					Spécialité: row.specialty || "",
					"Mode de participation": (() => {
						if (row.userJourney?.some((uj: any) => uj.type === 'en ligne')) {
							return "EN LIGNE";
						} else if (row.userJourney?.some((uj: any) => uj.type === 'présentiel')) {
							return "EN PRÉSENTIEL";
						} else {
							return "MIXTE";
						}
					})(),
					"Vidéos vues": row.videoWatches?.length ?? 0,
					"Dernière activité": row.userJourney?.length
						? new Date(row.userJourney.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b).timestamp).toLocaleString()
						: "-",
				})}
				onExportExcel={handleExportExcel}
				onExportPDF={handleExportPDF}
				state={{ isLoading: loading, pagination: { pageIndex: 0, pageSize: 10 }, sorting: [] }}
				enablePagination
				enableSorting={false}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
			/>
			<ParticipantDetailModal participant={selected} opened={modalOpen} onClose={() => setModalOpen(false)} />
			{filteredParticipants.length > pageSize && (
				<Pagination
					mt="md"
					value={page}
					onChange={setPage}
					total={Math.ceil(filteredParticipants.length / pageSize)}
				/>
			)}
			<Modal opened={exporting} onClose={() => { }} withCloseButton={false} centered size="md" radius="lg">
				<Box p="md" style={{ minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
					<Title order={4} ta="center" mb="md" style={{ color: '#2563eb', fontWeight: 700 }}>
						Export des fiches de consentement
					</Title>
					<Group justify="center" align="center" mt="md" mb="md">
						<Loader size="lg" color="blue" />
					</Group>
					<Text ta="center" size="sm" c="dimmed" mt={-8}>
						Génération en cours...
					</Text>
					<Group mt="md" mb={8} align="center" justify="space-between">
						<Box style={{ flex: 1 }}>
							<Progress value={exportTotal ? (exportProgress / exportTotal) * 100 : 0} size="md" color={exportProgress === exportTotal ? 'teal' : 'blue'} radius="xl" />
						</Box>
						<Text ml="md" fw={700} c={exportProgress === exportTotal ? 'teal' : 'blue'}>
							{Math.round(exportTotal ? (exportProgress / exportTotal) * 100 : 0)}%
						</Text>
					</Group>
					<Text ta="center" mt={4} mb={4} size="sm" c="dimmed">
						{exportProgress} / {exportTotal} PDF générés
					</Text>
					{exportCurrentName && (
						<Text ta="center" mt={0} mb={8} fw={700} size="lg" c="blue.7">
							{exportCurrentName}
						</Text>
					)}
					{exportError && (
						<Box mt={12} p="sm" style={{ background: '#fee2e2', borderRadius: 8 }}>
							<Text color="red" ta="center" size="sm">{exportError}</Text>
						</Box>
					)}
					{/* <Button mt="md" variant="light" color="gray" disabled>Annuler</Button> */}
				</Box>
			</Modal>
		</PageContainer>
	);
}

"use client";

import { Button, Group } from "@mantine/core";
import { IconFileTypePdf, IconFileSpreadsheet } from "@tabler/icons-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FormattedPageVisit } from "@/services/pageVisits.service";

interface PageVisitsReportProps {
	allPageVisits: FormattedPageVisit[];
	totalCount: number;
}

export default function PageVisitsReport({
	allPageVisits,
	totalCount,
}: PageVisitsReportProps) {
	const generatePDFReport = () => {
		const doc = new jsPDF({ orientation: "landscape" });

		// Logo (si disponible)
		const img = new window.Image();
		img.src = "/logo-forum-cancer.png";

		img.onload = () => {
			// Header avec logo
			doc.addImage(img, "PNG", doc.internal.pageSize.width - 40, 10, 25, 20);

			// Titre
			doc.setFont("helvetica", "bold");
			doc.setFontSize(16);
			doc.setTextColor(0, 63, 155);
			doc.text("Rapport des Visites de Pages", 14, 20);

			// Date de génération
			doc.setFont("helvetica", "normal");
			doc.setFontSize(10);
			doc.setTextColor(0, 0, 0);
			const date = new Date().toLocaleString("fr-FR", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
			doc.text(`Généré le : ${date}`, 14, 28);

			// Statistiques
			doc.setFont("helvetica", "bold");
			doc.setFontSize(11);
			doc.text(`Total de visites : ${totalCount}`, 14, 36);

			// Calculer les statistiques des pages les plus visitées
			const pageCounts = new Map<string, number>();
			allPageVisits.forEach((visit) => {
				const url = visit.pageUrl;
				const currentCount = pageCounts.get(url) || 0;
				pageCounts.set(url, currentCount + 1);
			});

			const topPages = Array.from(pageCounts.entries())
				.map(([pageUrl, count]) => ({ pageUrl, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);

			if (topPages.length > 0) {
				let y = 44;
				doc.setFont("helvetica", "bold");
				doc.setFontSize(10);
				doc.text("Top 5 des pages les plus visitées :", 14, y);

				y += 6;
				doc.setFont("helvetica", "normal");
				doc.setFontSize(9);
				topPages.forEach((page, index) => {
					doc.text(
						`${index + 1}. ${page.pageUrl.substring(0, 50)}${page.pageUrl.length > 50 ? "..." : ""} - ${page.count} visite(s)`,
						16,
						y
					);
					y += 5;
				});
			}

			// Ligne de séparation
			const startY = topPages.length > 0 ? 80 : 50;
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.2);
			doc.line(14, startY, doc.internal.pageSize.width - 14, startY);

			// Tableau des visites
			const tableColumns = [
				"ID",
				"Utilisateur",
				"Email",
				"URL de la page",
				"Temps passé",
				"Date de visite",
			];

			const tableRows = allPageVisits.map((visit) => [
				visit.id.toString(),
				visit.userName,
				visit.userEmail,
				visit.pageUrl.length > 40
					? `${visit.pageUrl.substring(0, 40)}...`
					: visit.pageUrl,
				visit.timeSpentFormatted,
				visit.dateVisited,
			]);

			autoTable(doc, {
				head: [tableColumns],
				body: tableRows,
				startY: startY + 5,
				styles: { fontSize: 7 },
				headStyles: {
					fillColor: [0, 63, 155],
					textColor: 255,
					fontStyle: "bold",
				},
				alternateRowStyles: { fillColor: [245, 248, 255] },
				margin: { top: startY + 5, left: 14, right: 14 },
			});

			// Pagination
			const pageCount = doc.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(9);
				doc.text(
					`Page ${i} / ${pageCount}`,
					14,
					doc.internal.pageSize.height - 10
				);
			}

			doc.save(
				`rapport-visites-pages-${new Date().toISOString().slice(0, 10)}.pdf`
			);
		};

		img.onerror = () => {
			// Si le logo n'existe pas, générer sans logo
			doc.setFont("helvetica", "bold");
			doc.setFontSize(16);
			doc.setTextColor(0, 63, 155);
			doc.text("Rapport des Visites de Pages", 14, 20);

			doc.setFont("helvetica", "normal");
			doc.setFontSize(10);
			doc.setTextColor(0, 0, 0);
			const date = new Date().toLocaleString("fr-FR", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
			doc.text(`Généré le : ${date}`, 14, 28);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(11);
			doc.text(`Total de visites : ${totalCount}`, 14, 36);

			const tableColumns = [
				"ID",
				"Utilisateur",
				"Email",
				"URL de la page",
				"Temps passé",
				"Date de visite",
			];

			const tableRows = allPageVisits.map((visit) => [
				visit.id.toString(),
				visit.userName,
				visit.userEmail,
				visit.pageUrl.length > 40
					? `${visit.pageUrl.substring(0, 40)}...`
					: visit.pageUrl,
				visit.timeSpentFormatted,
				visit.dateVisited,
			]);

			autoTable(doc, {
				head: [tableColumns],
				body: tableRows,
				startY: 45,
				styles: { fontSize: 7 },
				headStyles: {
					fillColor: [0, 63, 155],
					textColor: 255,
					fontStyle: "bold",
				},
				alternateRowStyles: { fillColor: [245, 248, 255] },
			});

			const pageCount = doc.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(9);
				doc.text(
					`Page ${i} / ${pageCount}`,
					14,
					doc.internal.pageSize.height - 10
				);
			}

			doc.save(
				`rapport-visites-pages-${new Date().toISOString().slice(0, 10)}.pdf`
			);
		};
	};

	const exportToExcel = () => {
		const exportData = allPageVisits.map((visit) => ({
			"ID Visite": visit.id,
			"ID Utilisateur": visit.userId,
			Prénom: visit.userName.split(" ")[0],
			Nom: visit.userName.split(" ").slice(1).join(" "),
			"Nom complet": visit.userName,
			Email: visit.userEmail,
			"URL de la page": visit.pageUrl,
			"Temps passé (secondes)": visit.timeSpent || "",
			"Temps passé (formaté)": visit.timeSpentFormatted,
			"Date de visite": visit.dateVisited,
		}));

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Visites de pages");

		// Ajuster la largeur des colonnes
		const colWidths = [
			{ wch: 10 }, // ID Visite
			{ wch: 12 }, // ID Utilisateur
			{ wch: 15 }, // Prénom
			{ wch: 15 }, // Nom
			{ wch: 25 }, // Nom complet
			{ wch: 30 }, // Email
			{ wch: 40 }, // URL de la page
			{ wch: 15 }, // Temps passé (secondes)
			{ wch: 15 }, // Temps passé (formaté)
			{ wch: 20 }, // Date de visite
		];
		ws["!cols"] = colWidths;

		const fileName = `visites-pages-${new Date().toISOString().slice(0, 10)}.xlsx`;
		XLSX.writeFile(wb, fileName);
	};

	return (
		<Group gap="sm">
			<Button
				leftSection={<IconFileTypePdf size={18} />}
				variant="light"
				color="red"
				onClick={generatePDFReport}
				disabled={allPageVisits.length === 0}
			>
				Rapport PDF
			</Button>
			<Button
				leftSection={<IconFileSpreadsheet size={18} />}
				variant="light"
				color="green"
				onClick={exportToExcel}
				disabled={allPageVisits.length === 0}
			>
				Export Excel
			</Button>
		</Group>
	);
}


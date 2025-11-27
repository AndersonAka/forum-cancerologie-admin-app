"use client";

import { Button, Group } from "@mantine/core";
import { IconFileTypePdf, IconFileSpreadsheet } from "@tabler/icons-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FormattedVideoWatch } from "@/services/videoWatches.service";

interface VideoWatchesReportProps {
	allVideoWatches: FormattedVideoWatch[];
	totalCount: number;
}

export default function VideoWatchesReport({
	allVideoWatches,
	totalCount,
}: VideoWatchesReportProps) {
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
			doc.text("Rapport des Vidéos Regardées", 14, 20);

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
			doc.text(`Total de visualisations : ${totalCount}`, 14, 36);

			// Calculer les statistiques des vidéos les plus regardées
			const videoCounts = new Map<string, { count: number; auteur: string }>();
			allVideoWatches.forEach((watch) => {
				const videoId = watch.videoId;
				const existing = videoCounts.get(videoId) || { count: 0, auteur: watch.auteur };
				videoCounts.set(videoId, {
					count: existing.count + 1,
					auteur: watch.auteur,
				});
			});

			const topVideos = Array.from(videoCounts.entries())
				.map(([videoId, data]) => ({ videoId, auteur: data.auteur, count: data.count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);

			// Statistiques de complétion
			const completedCount = allVideoWatches.filter((w) => w.completed).length;
			const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0;

			if (topVideos.length > 0) {
				let y = 44;
				doc.setFont("helvetica", "bold");
				doc.setFontSize(10);
				doc.text("Top 5 des vidéos les plus regardées :", 14, y);

				y += 6;
				doc.setFont("helvetica", "normal");
				doc.setFontSize(9);
				topVideos.forEach((video, index) => {
					doc.text(
						`${index + 1}. ${video.videoId.substring(0, 40)}${video.videoId.length > 40 ? "..." : ""} (${video.auteur}) - ${video.count} visualisation(s)`,
						16,
						y
					);
					y += 5;
				});

				y += 3;
				doc.setFont("helvetica", "bold");
				doc.setFontSize(10);
				doc.text(`Taux de complétion : ${completionRate}% (${completedCount}/${totalCount})`, 14, y);
			}

			// Ligne de séparation
			const startY = topVideos.length > 0 ? 85 : 50;
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.2);
			doc.line(14, startY, doc.internal.pageSize.width - 14, startY);

			// Tableau des visualisations
			const tableColumns = [
				"ID",
				"Utilisateur",
				"Email",
				"ID Vidéo",
				"Auteur",
				"Durée",
				"Progression",
				"Statut",
				"Date",
			];

			const tableRows = allVideoWatches.map((watch) => [
				watch.id.toString(),
				watch.userName,
				watch.userEmail,
				watch.videoId.length > 20 ? `${watch.videoId.substring(0, 20)}...` : watch.videoId,
				watch.auteur.length > 15 ? `${watch.auteur.substring(0, 15)}...` : watch.auteur,
				watch.durationFormatted,
				watch.progressFormatted,
				watch.completed ? "Complétée" : "En cours",
				watch.dateVisualisation,
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
				`rapport-videos-regardees-${new Date().toISOString().slice(0, 10)}.pdf`
			);
		};

		img.onerror = () => {
			// Si le logo n'existe pas, générer sans logo
			doc.setFont("helvetica", "bold");
			doc.setFontSize(16);
			doc.setTextColor(0, 63, 155);
			doc.text("Rapport des Vidéos Regardées", 14, 20);

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
			doc.text(`Total de visualisations : ${totalCount}`, 14, 36);

			const tableColumns = [
				"ID",
				"Utilisateur",
				"Email",
				"ID Vidéo",
				"Auteur",
				"Durée",
				"Progression",
				"Statut",
				"Date",
			];

			const tableRows = allVideoWatches.map((watch) => [
				watch.id.toString(),
				watch.userName,
				watch.userEmail,
				watch.videoId.length > 20 ? `${watch.videoId.substring(0, 20)}...` : watch.videoId,
				watch.auteur.length > 15 ? `${watch.auteur.substring(0, 15)}...` : watch.auteur,
				watch.durationFormatted,
				watch.progressFormatted,
				watch.completed ? "Complétée" : "En cours",
				watch.dateVisualisation,
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
				`rapport-videos-regardees-${new Date().toISOString().slice(0, 10)}.pdf`
			);
		};
	};

	const exportToExcel = () => {
		const exportData = allVideoWatches.map((watch) => ({
			ID: watch.id,
			"ID Utilisateur": watch.userId,
			Prénom: watch.userName.split(" ")[0],
			Nom: watch.userName.split(" ").slice(1).join(" "),
			"Nom complet": watch.userName,
			Email: watch.userEmail,
			"ID Vidéo": watch.videoId,
			Auteur: watch.auteur,
			"Durée (secondes)": watch.duration || "",
			"Durée (formaté)": watch.durationFormatted,
			"Progression (%)": watch.progress || "",
			"Progression (formaté)": watch.progressFormatted,
			Complétée: watch.completed ? "Oui" : "Non",
			Statut: watch.completedFormatted,
			"Date de visualisation": watch.dateVisualisation,
			"Heure de début": watch.startTime,
		}));

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Vidéos regardées");

		// Ajuster la largeur des colonnes
		const colWidths = [
			{ wch: 8 }, // ID
			{ wch: 12 }, // ID Utilisateur
			{ wch: 15 }, // Prénom
			{ wch: 15 }, // Nom
			{ wch: 25 }, // Nom complet
			{ wch: 30 }, // Email
			{ wch: 20 }, // ID Vidéo
			{ wch: 20 }, // Auteur
			{ wch: 15 }, // Durée (secondes)
			{ wch: 15 }, // Durée (formaté)
			{ wch: 12 }, // Progression (%)
			{ wch: 15 }, // Progression (formaté)
			{ wch: 10 }, // Complétée
			{ wch: 15 }, // Statut
			{ wch: 20 }, // Date de visualisation
			{ wch: 20 }, // Heure de début
		];
		ws["!cols"] = colWidths;

		const fileName = `videos-regardees-${new Date().toISOString().slice(0, 10)}.xlsx`;
		XLSX.writeFile(wb, fileName);
	};

	return (
		<Group gap="sm">
			<Button
				leftSection={<IconFileTypePdf size={18} />}
				variant="light"
				color="red"
				onClick={generatePDFReport}
				disabled={allVideoWatches.length === 0}
			>
				Rapport PDF
			</Button>
			<Button
				leftSection={<IconFileSpreadsheet size={18} />}
				variant="light"
				color="green"
				onClick={exportToExcel}
				disabled={allVideoWatches.length === 0}
			>
				Export Excel
			</Button>
		</Group>
	);
}


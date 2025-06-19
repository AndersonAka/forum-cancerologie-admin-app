import { Modal, Table, Text, Timeline, Group, Button, Avatar, Card, Box, Badge, Divider, Stack, Flex } from "@mantine/core";
import { IconUser, IconMail, IconUsers } from "@tabler/icons-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ParticipantDetailModalProps {
	participant: any;
	opened: boolean;
	onClose: () => void;
}

const eventTypeLabels: Record<string, string> = {
	PAGE_VIEW: "Visite d'une page",
	VIDEO_WATCH: "Visionnage d'une vidéo",
	CONTENT_INTERACTION: "Interaction avec un contenu",
	SEARCH: "Recherche effectuée",
	USER_REGISTRATION: "Inscription sur la plateforme",
	USER_LOGIN_EMAIL_ONLY: "Connexion (email uniquement)",
	USER_LOGIN_WITH_PASSWORD: "Connexion (email + mot de passe)",
	USER_LOGOUT: "Déconnexion",
	PARTICIPATION_MODE_UPDATE: "Changement du mode de participation",
	USER_PROFILE_UPDATE: "Mise à jour du profil",
	CONSENT_GIVEN: "Consentement RGPD donné",
	CONSENT_REVOKED: "Consentement RGPD retiré",
};

export default function ParticipantDetailModal({ participant, opened, onClose }: ParticipantDetailModalProps) {
	if (!participant) return null;

	const handleExportPDF = () => {
		const doc = new jsPDF();

		// Logo
		const img = new window.Image();
		img.src = "/logo-forum-cancer.png";

		img.onload = () => {
			// Header avec logo et titre
			doc.addImage(img, "PNG", 160, 10, 25, 20);
			doc.setFontSize(20);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text('Forum de Cancérologie de ROCHE', 14, 20);

			doc.setFontSize(13);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(0, 0, 0);
			doc.text('Détail du participant', 14, 28);

			// Ligne de séparation
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.5);
			doc.line(14, 32, 196, 32);

			// Infos principales
			doc.setFontSize(12);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text('Nom :', 14, 40);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(0, 0, 0);
			doc.text(`${participant.firstName || ''} ${participant.lastName || ''}`.trim(), 35, 40);

			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text('Email :', 14, 47);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(0, 0, 0);
			doc.text(participant.email || '-', 35, 47);

			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text('Mode de participation :', 14, 54);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(0, 0, 0);
			doc.text(mode, 65, 54);

			// Date d'export
			doc.setFontSize(9);
			doc.setFont('helvetica', 'italic');
			doc.setTextColor(100, 100, 100);
			const exportDate = new Date().toLocaleDateString('fr-FR', {
				day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
			});
			doc.text(`Document généré le ${exportDate}`, 14, 61);

			// Section Pages visitées
			doc.setFontSize(11);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 63, 155);
			doc.text('Pages visitées', 14, 72);
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.2);
			doc.line(14, 74, 196, 74);

			autoTable(doc, {
				startY: 78,
				head: [["URL", "Temps passé (s)", "Date"]],
				body: (participant.pageVisits || []).map((pv: any) => [
					pv.pageUrl,
					pv.timeSpent ?? "-",
					pv.createdAt ? new Date(pv.createdAt).toLocaleString() : "-",
				]),
				styles: { fontSize: 8 },
				headStyles: { fillColor: [0, 63, 155], textColor: 255, fontStyle: 'bold' },
				alternateRowStyles: { fillColor: [245, 248, 255] },
			});

			// Section Vidéos vues
			let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 88;
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(11);
			doc.setTextColor(0, 63, 155);
			doc.text('Vidéos vues', 14, y);
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.2);
			doc.line(14, y + 2, 196, y + 2);

			autoTable(doc, {
				startY: y + 6,
				head: [["Vidéo", "Progression (%)", "Durée (s)", "Auteur", "Date"]],
				body: (participant.videoWatches || []).map((vw: any) => [
					vw.videoId,
					vw.progress ?? "-",
					vw.duration ?? "-",
					vw.auteur ?? "-",
					vw.dateVisualisation ? new Date(vw.dateVisualisation).toLocaleString() : "-",
				]),
				styles: { fontSize: 8 },
				headStyles: { fillColor: [0, 63, 155], textColor: 255, fontStyle: 'bold' },
				alternateRowStyles: { fillColor: [245, 248, 255] },
			});

			y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(11);
			doc.setTextColor(0, 63, 155);
			doc.text('Parcours utilisateur', 14, y);
			doc.setDrawColor(0, 63, 155);
			doc.setLineWidth(0.2);
			doc.line(14, y + 2, 196, y + 2);

			autoTable(doc, {
				startY: y + 6,
				head: [["Type d'événement", "Date", "Détails"]],
				body: (participant.userJourney || []).map((uj: any) => [
					eventTypeLabels[uj.eventType] || uj.eventType,
					uj.timestamp ? new Date(uj.timestamp).toLocaleString() : "-",
					uj.eventDetails ? JSON.stringify(uj.eventDetails) : "-",
				]),
				styles: { fontSize: 8 },
				headStyles: { fillColor: [0, 63, 155], textColor: 255, fontStyle: 'bold' },
				alternateRowStyles: { fillColor: [245, 248, 255] },
			});

			// Pagination et logo en pied de page
			const pageCount = doc.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(9);
				doc.text(`Page ${i} / ${pageCount}`, 14, doc.internal.pageSize.height - 10);
				doc.addImage(img, "PNG", 170, doc.internal.pageSize.height - 15, 15, 12);
			}

			doc.save(`PARCOURS_${participant.firstName || ""}_${participant.lastName || ""}.pdf`);
		};

		img.onerror = () => {
			alert("Erreur de chargement du logo !");
		};
	};

	const mode = participant.participationMode
		? participant.participationMode.toUpperCase()
		: (participant.userJourney?.some((uj: any) => uj.type === 'en ligne') ? "EN LIGNE" : participant.userJourney?.some((uj: any) => uj.type === 'onsite') ? "EN PRÉSENTIEL" : "MIXTE");

	return (
		<Modal opened={opened} onClose={onClose} title={null} size="xl" radius="lg">
			<Text fw={800} size="xl" mb="md">Détail de {participant.firstName.toUpperCase() || ''} {participant.lastName.toUpperCase() || ''}</Text>
			<Card shadow="md" radius="md" p="xl" withBorder>
				<Flex align="center" gap="lg" mb="md">
					<Avatar color="blue" radius="xl" size={64} src={null}>
						<IconUser size={36} />
					</Avatar>
					<Stack gap={0}>
						<Text fw={700} size="xl">{participant.firstName} {participant.lastName}</Text>
						<Group gap="xs">
							<Badge color={mode === "en ligne" ? "teal" : mode === "présentiel" ? "indigo" : "gray"} variant="filled" size="md">
								{mode}
							</Badge>
							<Group gap={4} align="center">
								<IconMail size={16} />
								<Text size="sm" c="dimmed">{participant.email}</Text>
							</Group>
						</Group>
					</Stack>
				</Flex>
				<Divider my="md" />
				<Group mb="md" justify="flex-end">
					<Button color="red" variant="light" onClick={handleExportPDF}>
						Exporter le parcours en PDF
					</Button>
				</Group>
				<Stack gap="md">
					<Card shadow="xs" radius="md" p="md" withBorder>
						<Text fw={700} mb="xs">Pages visitées</Text>
						<Table striped withColumnBorders mb="md">
							<thead>
								<tr>
									<th>URL</th>
									<th>Temps passé (s)</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{(participant.pageVisits || []).length === 0 ? (
									<tr><td colSpan={3}><Text c="dimmed">Aucune page visitée</Text></td></tr>
								) : (
									participant.pageVisits.map((pv: any, i: number) => (
										<tr key={i}>
											<td>{pv.pageUrl}</td>
											<td>{pv.timeSpent ?? "-"}</td>
											<td>{pv.createdAt ? new Date(pv.createdAt).toLocaleString() : "-"}</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</Card>
					<Card shadow="xs" radius="md" p="md" withBorder>
						<Text fw={700} mb="xs">Vidéos vues</Text>
						<Table striped withColumnBorders mb="md">
							<thead>
								<tr>
									<th>Vidéo</th>
									<th>Progression (%)</th>
									<th>Durée (s)</th>
									<th>Auteur</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{(participant.videoWatches || []).length === 0 ? (
									<tr><td colSpan={5}><Text c="dimmed">Aucune vidéo vue</Text></td></tr>
								) : (
									participant.videoWatches.map((vw: any, i: number) => (
										<tr key={i}>
											<td>{vw.videoId}</td>
											<td>{vw.progress ?? "-"}</td>
											<td>{vw.duration ?? "-"}</td>
											<td>{vw.auteur ?? "-"}</td>
											<td>{vw.dateVisualisation ? new Date(vw.dateVisualisation).toLocaleString() : "-"}</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</Card>
					<Card shadow="xs" radius="md" p="md" withBorder>
						<Text fw={700} mb="xs">Parcours utilisateur</Text>
						<Timeline active={-1} bulletSize={24} lineWidth={2}>
							{(participant.userJourney || []).length === 0 ? (
								<Timeline.Item title="Aucune activité">
									<Text c="dimmed" size="sm">Aucun événement enregistré</Text>
								</Timeline.Item>
							) : (
								participant.userJourney.map((uj: any, i: number) => (
									<Timeline.Item
										key={i}
										title={eventTypeLabels[uj.eventType] || uj.eventType}
										bullet={<Text size="xs">{i + 1}</Text>}
									>
										<Text size="sm">{uj.eventDetails ? JSON.stringify(uj.eventDetails) : "-"}</Text>
										<Text size="xs" c="dimmed">{uj.timestamp ? new Date(uj.timestamp).toLocaleString() : "-"}</Text>
									</Timeline.Item>
								))
							)}
						</Timeline>
					</Card>
				</Stack>
				<Group mt="xl" justify="flex-end">
					<Button onClick={onClose} variant="light">Fermer</Button>
				</Group>
			</Card>
		</Modal>
	);
}

import { Suspense } from "react";
import { DashboardContent } from "components/Dashboard/DashboardContent";
import { DashboardSkeleton } from "components/LoadingSpinner/LoadingSpinner";

// Metadata
export const metadata = {
	title: "Tableau de bord",
	description: "Administration Forum de Cancerologie de ROCHE",
};

// Page
export default function Dashboard() {
	return (
		<Suspense fallback={
			<DashboardSkeleton />
		}>
			<DashboardContent />
		</Suspense>
	);
}

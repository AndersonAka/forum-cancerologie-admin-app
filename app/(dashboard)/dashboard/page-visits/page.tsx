import { Suspense } from "react";
import PageVisitsTable from "@/components/PageVisits/PageVisitsTable";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import TitrePage from "@/components/TitrePage/TitrePage";
import { Stack } from "@mantine/core";

// Metadata
export const metadata = {
	title: "Visites de Pages",
	description: "Suivi des visites de pages par les utilisateurs",
};

// Page
export default function PageVisitsPage() {
	return (
		<PageContainer
			title={
				<TitrePage
					title="Visites de Pages"
					subtitle="Suivi des visites de pages par les utilisateurs"
				/>
			}
		>
			<Stack gap="lg">
				<Suspense fallback={<LoadingSpinner />}>
					<PageVisitsTable />
				</Suspense>
			</Stack>
		</PageContainer>
	);
}


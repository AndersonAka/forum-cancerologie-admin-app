import { Suspense } from "react";
import VideoWatchesTable from "@/components/VideoWatches/VideoWatchesTable";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import TitrePage from "@/components/TitrePage/TitrePage";
import { Stack } from "@mantine/core";

// Metadata
export const metadata = {
	title: "Vidéos Regardées",
	description: "Suivi des vidéos regardées par les utilisateurs",
};

// Page
export default function VideoWatchesPage() {
	return (
		<PageContainer
			title={
				<TitrePage
					title="Vidéos Regardées"
					subtitle="Suivi des vidéos regardées par les utilisateurs"
				/>
			}
		>
			<Stack gap="lg">
				<Suspense fallback={<LoadingSpinner />}>
					<VideoWatchesTable />
				</Suspense>
			</Stack>
		</PageContainer>
	);
}


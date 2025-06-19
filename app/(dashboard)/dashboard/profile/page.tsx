import { UserProfileCard } from "components/UserProfile/UserProfileCard";
import ProtectedRoute from "components/ProtectedRoute/ProtectedRoute";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import TitrePage from "@/components/TitrePage/TitrePage";

export default async function ProfilePage() {
	return (
		<ProtectedRoute>
			<PageContainer title={<TitrePage title="Mon profil" subtitle="Vue d'ensemble de mes informations" />}>
				<UserProfileCard />
			</PageContainer>
		</ProtectedRoute>
	);
}

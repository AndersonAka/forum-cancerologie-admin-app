import { PageContainer } from "@/components/PageContainer/PageContainer";
import { UsersTable } from "@/components/Table/UsersTable";

export default function UsersPage() {
	return (
		<PageContainer title="Gestion des utilisateurs">
			<UsersTable />
		</PageContainer>
	);
}

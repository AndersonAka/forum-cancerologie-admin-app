'use client';

import { PageContainer } from "@/components/PageContainer/PageContainer";
import UsersTable from "@/components/Table/UsersTable";
import TitrePage from "@/components/TitrePage/TitrePage";
import { useState } from "react";

export default function UsersPage() {
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	return (
		<PageContainer
			title={<TitrePage title="Gestion des utilisateurs" subtitle="Gestion des utilisateurs système" />}>
			<UsersTable refreshTrigger={refreshTrigger} />
		</PageContainer>
	);
}

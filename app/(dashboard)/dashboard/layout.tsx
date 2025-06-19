"use client";

import {
	AppShell,
	Burger,
	Text,
	useMantineColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "components/Headers/AdminHeader";
import { Navbar } from "components/Navbar/Navbar";
import { navLinks } from "config";
import { useAuth } from "contexts/AuthContext";

interface Props {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
	const [opened, { toggle }] = useDisclosure();
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const { role } = useAuth();

	const bg =
		colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0];

	const isParticipant = role === "USER";

	return (
		<AppShell
			header={{ height: 68 }}
			navbar={isParticipant ? undefined : { width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding="md"
			transitionDuration={500}
			transitionTimingFunction="ease"
		>
			<AppShell.Navbar>
				<Navbar data={navLinks} hidden={!opened} />
			</AppShell.Navbar>
			<AppShell.Header>
				<AdminHeader
					burger={
						<Burger
							opened={opened}
							onClick={toggle}
							hiddenFrom="sm"
							size="sm"
							mr="xl"
						/>
					}
				/>
			</AppShell.Header>
			<AppShell.Main bg={bg}>{children}</AppShell.Main>
			<AppShell.Footer>
				<Text w="full" size="sm" c="gray">
					CopyRight © 2025 IMPACT AFRIK
				</Text>
			</AppShell.Footer>
		</AppShell>
	);
}

"use client";

import { ActionIcon, Box, Drawer, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import classes from "./AdminHeader.module.css";
import { DirectionSwitcher } from "../DirectionSwitcher/DirectionSwitcher";
import { Logo } from "../Logo/Logo";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { UserProfile } from "../UserProfile/UserProfile";

interface Props {
	burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
	const [opened, { close, open }] = useDisclosure(false);

	return (
		<header className={classes.header}>
			{burger && burger}
			<div className={classes.logo}>
				<Logo />
			</div>
			<Box style={{ flex: 1 }} />
			<UserProfile showDropdown={true} size="md" variant="default" />
			<ActionIcon onClick={open} variant="subtle">
				<IconSettings size="1.25rem" />
			</ActionIcon>

			<Drawer
				opened={opened}
				onClose={close}
				title="Settings"
				position="right"
				transitionProps={{ duration: 0 }}
			>
				<Stack gap="lg">
					<ThemeSwitcher />
					<DirectionSwitcher />
				</Stack>
			</Drawer>
		</header>
	);
}

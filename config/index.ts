import {
	IconComponents,
	IconDashboard,
	IconLock,
	IconMoodSmile,
	IconUser,
} from "@tabler/icons-react";
import type { NavItem } from "types/nav-item";

export const navLinks: NavItem[] = [
	{ label: "Dashboard", icon: IconDashboard, link: "/dashboard" },
	{
		label: "Gestion des utilisateurs",
		icon: IconUser,
		link: "/dashboard/users",
	},
];

import {
	IconComponents,
	IconDashboard,
	IconCalendar,
	IconLock,
	IconMoodSmile,
	IconUser,
} from "@tabler/icons-react";
import type { NavItem } from "types/nav-item";

export const navLinks: NavItem[] = [
	{
		label: "Tableau de bord",
		icon: IconDashboard,
		link: "/dashboard",
		roles: ["SPADMIN", "ADMIN", "MANAGER"],
	},
	{
		label: "Participants",
		icon: IconMoodSmile,
		link: "/dashboard/participants",
		roles: ["SPADMIN", "ADMIN", "MANAGER"],
	},
	// {
	// 	label: "Agenda",
	// 	icon: IconCalendar,
	// 	link: "/dashboard/agenda",
	// 	roles: ["SPADMIN", "ADMIN", "MANAGER"],
	// },

	// {
	// 	label: "Orateurs",
	// 	icon: IconUser,
	// 	link: "/dashboard/speakers",
	// 	roles: ["SPADMIN", "ADMIN", "MANAGER"],
	// },
	{
		label: "Utilisateurs système",
		icon: IconUser,
		link: "/dashboard/users",
		roles: ["SPADMIN", "ADMIN"],
	},
];

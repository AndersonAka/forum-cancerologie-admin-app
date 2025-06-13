import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";

import {
	ColorSchemeScript,
	DirectionProvider,
	MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Analytics } from "@vercel/analytics/react";
import { inter } from "styles/fonts";
import { theme } from "styles/theme";
import { AppProvider } from "./provider";
import { AuthProvider } from "contexts/AuthContext";
import { NotificationProvider } from "contexts/NotificationContext";

export const metadata = {
	metadataBase: new URL("https://forum-cancerologie-admin-app.vercel.app/"),
	title: {
		default: "Forum Cancerologie Admin",
		template: "%s | Forum Cancerologie Admin",
	},
	description: "Admin App for Forum Cancerologie",
	keywords: [
		"Forum Cancerologie",
		"Admin",
		"App",
		"Forum Cancerologie Admin",
		"Forum Cancerologie Admin App",
	],
	authors: [
		{
			name: "Anderson Aka",
			url: "https://andersonaka.com",
		},
	],
	creator: "Anderson Aka",
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="fr-FR">
			<head>
				<ColorSchemeScript />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body className={inter.className}>
				<AuthProvider>
					<DirectionProvider>
						<MantineProvider theme={theme}>
							<ModalsProvider>
								<AppProvider>
									<NotificationProvider>
										{children}
									</NotificationProvider>
								</AppProvider>
								<Analytics />
							</ModalsProvider>
							<Notifications />
						</MantineProvider>
					</DirectionProvider>
				</AuthProvider>
			</body>
		</html>
	);
}

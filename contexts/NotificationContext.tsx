"use client";

import { createContext, useContext } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface NotificationContextType {
	showSuccess: (message: string) => void;
	showError: (message: string) => void;
	showInfo: (message: string) => void;
	showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
	const showSuccess = (message: string) => {
		notifications.show({
			title: 'Succès',
			message,
			color: 'green',
			icon: <IconCheck size="1.1rem" />,
		});
	};

	const showError = (message: string) => {
		notifications.show({
			title: 'Erreur',
			message,
			color: 'red',
			icon: <IconX size="1.1rem" />,
		});
	};

	const showInfo = (message: string) => {
		notifications.show({
			title: 'Information',
			message,
			color: 'blue',
		});
	};

	const showWarning = (message: string) => {
		notifications.show({
			title: 'Attention',
			message,
			color: 'yellow',
		});
	};

	return (
		<NotificationContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationProvider');
	}
	return context;
}

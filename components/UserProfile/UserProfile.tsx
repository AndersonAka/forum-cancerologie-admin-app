'use client';

import React, { useState } from 'react';
import {
	Group,
	Avatar,
	Text,
	Box,
	Menu,
	ActionIcon,
	Skeleton,
	Divider
} from '@mantine/core';
import { IconUser, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
	showDropdown?: boolean;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'compact';
	color?: string
}

export function UserProfile({
	showDropdown = true,
	size = 'md',
	variant = 'default',
	color = 'white'
}: UserProfileProps) {
	const { user, logout, isLoading } = useAuth();
	const router = useRouter();
	const [menuOpened, setMenuOpened] = useState(false);

	// Fonction pour obtenir le nom complet de l'utilisateur
	const getUserDisplayName = () => {
		if (!user) return "Utilisateur";

		const firstName = user.firstName || "";
		const lastName = user.lastName || "";

		if (firstName && lastName) {
			return `${firstName} ${lastName}`;
		} else if (firstName) {
			return firstName;
		} else if (lastName) {
			return lastName;
		} else {
			return user.email || "Utilisateur";
		}
	};

	// Fonction pour obtenir les initiales
	const getUserInitials = () => {
		if (!user) return "U";

		const firstName = user.firstName || "";
		const lastName = user.lastName || "";

		if (firstName && lastName) {
			return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
		} else if (firstName) {
			return firstName.charAt(0).toUpperCase();
		} else if (lastName) {
			return lastName.charAt(0).toUpperCase();
		} else {
			return "U";
		}
	};

	// Fonction pour obtenir la taille de l'avatar
	const getAvatarSize = () => {
		switch (size) {
			case 'sm': return 'sm';
			case 'md': return 'md';
			case 'lg': return 'lg';
			default: return 'md';
		}
	};

	// Fonction pour obtenir la taille du texte
	const getTextSize = () => {
		switch (size) {
			case 'sm': return 'sm';
			case 'md': return 'md';
			case 'lg': return 'lg';
			default: return 'md';
		}
	};

	// Gestion de la déconnexion
	const handleLogout = () => {
		logout();
		router.push('/login');
	};

	// Gestion du profil
	const handleProfile = () => {
		router.push('/dashboard/profile');
	};

	// Skeleton de chargement
	if (isLoading) {
		return (
			<Group gap="sm" align="center">
				<Skeleton height={getAvatarSize() === 'sm' ? 32 : getAvatarSize() === 'md' ? 40 : 48} circle />
				{variant !== 'compact' && (
					<Box>
						<Skeleton height={16} width={100} mb={4} />
						<Skeleton height={14} width={80} />
					</Box>
				)}
			</Group>
		);
	}

	// Si pas d'utilisateur connecté
	if (!user) {
		return (
			<Group gap="sm" align="center">
				<Avatar color="gray" radius="xl" size={getAvatarSize()}>
					U
				</Avatar>
				{variant !== 'compact' && (
					<Text size={getTextSize()} fw={600} c="dimmed">
						Non connecté
					</Text>
				)}
			</Group>
		);
	}

	// Composant avec menu déroulant
	if (showDropdown) {
		return (
			<Menu
				opened={menuOpened}
				onChange={setMenuOpened}
				width={200}
				position="bottom-end"
				shadow="md"
				closeOnItemClick={true}
			>
				<Menu.Target>
					<Group
						gap="sm"
						align="center"
						style={{ cursor: 'pointer' }}
						onClick={() => setMenuOpened(!menuOpened)}
					>
						<Avatar
							color={color ? color : 'white'}
							radius="xl"
							size={getAvatarSize()}
						>
							{getUserInitials()}
						</Avatar>
						{variant !== 'compact' && (
							<Box>
								<Text size={getTextSize()} fw={600} c={color ? color : 'white'}>
									{getUserDisplayName()}
								</Text>
							</Box>
						)}
						<ActionIcon variant="subtle" color={color ? color : 'white'} size="sm">
							<IconChevronDown size={16} />
						</ActionIcon>
					</Group>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>Compte utilisateur</Menu.Label>
					<Menu.Item
						leftSection={<IconUser size={16} />}
						onClick={handleProfile}
					>
						Profil
					</Menu.Item>
					<Divider />
					<Menu.Item
						leftSection={<IconLogout size={16} />}
						color="red"
						onClick={handleLogout}
					>
						Déconnexion
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		);
	}

	// Composant simple sans menu
	return (
		<Group gap="sm" align="center">
			<Avatar
				color={color ? color : 'white'}
				radius="xl"
				size={getAvatarSize()}
			>
				{getUserInitials()}
			</Avatar>
			{variant !== 'compact' && (
				<Box>
					<Text size={getTextSize()} fw={600} c={color ? color : 'white'}>
						{getUserDisplayName()}
					</Text>
				</Box>
			)}
		</Group>
	);
}

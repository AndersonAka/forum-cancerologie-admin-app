"use client";

import { Box, Flex, Text } from "@mantine/core";
import Link from "next/link";
import classes from "./Logo.module.css";
import { IconShieldLock } from "@tabler/icons-react";
import Image from "next/image";

interface Props {
	width?: string;
	height?: string;
}

export const Logo: React.FC<Props> = () => {
	return (
		<Flex direction="row" justify="center" align="center" gap={4}>
			<Link
				href="/"
				style={{ textDecoration: "none" }}
				className={classes.heading}
			>
				<Flex direction="row" align="center" gap={4}>
					{/* <IconShieldLock size={35} stroke={1.5} color="white" /> */}
					<Image src="/logo-forum-cancer.png" alt="Logo" width={45} height={40} />
					<Text fw="bolder" size="xl" c="white">
						Administration
						- Forum de cancerologie
					</Text>
				</Flex>
			</Link>
		</Flex>
	);
};

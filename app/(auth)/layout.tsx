import { Anchor, Box, Flex, Text, Title } from "@mantine/core";
import { IconShieldLock } from "@tabler/icons-react";
import classes from "./layout.module.css";
import Image from "next/image";

interface Props {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	return (
		<Box className={classes.wrapper}>
			<Box ta="center" mb="md">
				<Image src="/logo-forum-cancer.png" alt="Logo" width={85} height={80} />
			</Box>
			<Title order={1} fw="bolder">
				Forum de Cancerologie de ROCHE
			</Title>
			<Flex direction="row" align="center" gap={4}>
				<Text size="lg" mt={5} fw="bold" ta="center" fz="lg">
					Administration
				</Text>
			</Flex>
			<Box w={400}>{children}</Box>
		</Box>
	);
}

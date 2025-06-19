import { Anchor, Box, Text, Title } from "@mantine/core";
import { IconShieldLock } from "@tabler/icons-react";
import classes from "./layout.module.css";

interface Props {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	return (
		<Box className={classes.wrapper}>
			<Box ta="center" mb="md">
				<IconShieldLock size={48} stroke={1.5} />
			</Box>
			<Title order={1} fw="bolder">
				Forum Cancerologie
			</Title>
			<Text c="dimmed" size="sm" mt={5} fw="bold" ta="center" fz="lg">
				Administration
			</Text>
			<Box w={400}>{children}</Box>
		</Box>
	);
}

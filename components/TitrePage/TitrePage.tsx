import { Box, Text, Flex, Title } from "@mantine/core";

interface TitrePageProps {
	title: string;
	subtitle?: string;
	icon?: React.ComponentType<{ size?: number; color?: string }>;
	iconColor?: string;
	iconSize?: number;
	titleSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2rem" | "3rem" | "4rem" | "5rem";
	subtitleSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2rem" | "3rem" | "4rem" | "5rem";
	titleWeight?: number;
	mb?: number | string;
	align?: "left" | "center" | "right";
	showDivider?: boolean;
	dividerColor?: string;
}

export const TitrePage = ({
	title,
	subtitle,
	icon: Icon,
	iconColor = "#3b82f6",
	iconSize = 32,
	titleSize = "2rem",
	subtitleSize = "lg",
	titleWeight = 800,
	mb = 8,
	align = "left",
	showDivider = false,
	dividerColor = "#e2e8f0"
}: TitrePageProps) => {
	return (
		<Box mb={mb}>
			<Flex
				direction="row"
				gap="md"
				align="center"
				justify={align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"}
			>
				{Icon && (
					<Box
						style={{
							background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%)`,
							borderRadius: '12px',
							padding: '12px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: `${iconSize + 24}px`,
							height: `${iconSize + 24}px`,
						}}
					>
						<Icon size={iconSize} color="white" />
					</Box>
				)}
				<Box>
					<Title
						order={1}
						fw={titleWeight}
						size={titleSize}
						mb={subtitle ? 8 : 0}
						ta={align}
					>
						{title}
					</Title>
					{subtitle && (
						<Text
							size={subtitleSize}
							c="dimmed"
							ta={align}
						>
							{subtitle}
						</Text>
					)}
				</Box>
			</Flex>
			{showDivider && (
				<Box
					mt="md"
					style={{
						height: '2px',
						background: `linear-gradient(90deg, ${dividerColor} 0%, transparent 100%)`,
						borderRadius: '1px',
					}}
				/>
			)}
		</Box>
	);
};

export default TitrePage;

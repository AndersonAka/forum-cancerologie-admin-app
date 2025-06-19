"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
	fontFamily: "Space Grotesk, sans-serif",
	headings: {
		fontFamily: "Space Grotesk, sans-serif",
	},
	colors: {
		primary: [
			"#e6f0ff", // 0 - Très clair (fond, hover léger)
			"#cce0ff", // 1 - Clair (fond de carte, hover)
			"#99c2ff", // 2 - Moyen-clair (bordure, accent)
			"#66a3ff", // 3 - Moyen (boutons secondaires)
			"#3385ff", // 4 - Moyen-foncé (boutons primaires)
			"#0066ff", // 5 - Foncé (texte sur fond clair)
			"#0052cc", // 6 - Plus foncé (hover boutons)
			"#003d99", // 7 - Très foncé (texte important)
			"#002966", // 8 - Extrêmement foncé (texte de titre)
			"#001433", // 9 - Le plus foncé (fond sombre)
		],
	},
	primaryColor: "primary",
	defaultRadius: "md",
	components: {
		Button: {
			defaultProps: {
				radius: "md",
			},
		},
		Paper: {
			defaultProps: {
				radius: "md",
			},
		},
		Card: {
			defaultProps: {
				radius: "md",
			},
		},
		Input: {
			defaultProps: {
				radius: "md",
			},
		},
		Select: {
			defaultProps: {
				radius: "md",
			},
		},
		TextInput: {
			defaultProps: {
				radius: "md",
			},
		},
		DatePickerInput: {
			defaultProps: {
				radius: "md",
			},
		},
		DateTimePicker: {
			defaultProps: {
				radius: "md",
			},
		},
	},
});

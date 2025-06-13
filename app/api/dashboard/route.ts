import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET() {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token");

		console.log("Token présent:", !!token);
		console.log("Valeur du token:", token?.value);

		if (!token) {
			console.log("Aucun token trouvé dans les cookies");
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		console.log("URL de l'API:", process.env.NEXT_PUBLIC_API_URL);

		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
			{
				headers: {
					Authorization: `Bearer ${token.value}`,
				},
			}
		);

		console.log("Réponse de l'API:", response.status);
		return NextResponse.json(response.data);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des données du dashboard:",
			error instanceof Error ? error.message : "Erreur inconnue"
		);
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des données" },
			{ status: 500 }
		);
	}
}

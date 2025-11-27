import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

// Marquer la route comme dynamique
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token");
		
		if (!token || !token.value) {
			return NextResponse.json(
				{ error: "Token d'authentification manquant" },
				{ status: 401 }
			);
		}

		const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
		
		const response = await axios.get(`${API_URL}/dashboard`, {
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});

		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Erreur lors de la récupération des données:", error);
		
		// Si c'est une erreur axios avec une réponse du serveur
		if (error.response) {
			const status = error.response.status;
			const message = error.response.data?.message || error.response.data?.error || "Erreur lors de la récupération des données";
			
			// Propager le statut d'erreur du backend (401, 403, etc.)
			return NextResponse.json(
				{ error: message },
				{ status }
			);
		}
		
		// Erreur réseau ou autre
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des données" },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Récupérer le token d'authentification depuis les cookies
		const token = request.cookies.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Token d'authentification manquant" },
				{ status: 401 }
			);
		}

		// Appeler la route backend pour récupérer uniquement les admins
		const backendUrl =
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
		const response = await fetch(`${backendUrl}/users/admins`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return NextResponse.json(
				{
					error:
						errorData.message ||
						`Erreur ${response.status}: ${response.statusText}`,
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		// Retourner directement les admins
		return NextResponse.json(data);
	} catch (error) {
		console.error("Erreur lors de la récupération des admins:", error);
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 }
		);
	}
}

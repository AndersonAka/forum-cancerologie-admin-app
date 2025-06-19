import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// GET /api/users
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const skip = searchParams.get("skip");
		const take = searchParams.get("take");
		const orderBy = searchParams.get("orderBy");
		const where = searchParams.get("where");
		const cursor = searchParams.get("cursor");

		const params = new URLSearchParams();
		if (skip) params.append("skip", skip);
		if (take) params.append("take", take);
		if (orderBy) params.append("orderBy", orderBy);
		if (where) params.append("where", where);
		if (cursor) params.append("cursor", cursor);

		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// Ajout des métadonnées de pagination
		const totalCount = response.headers["x-total-count"] as string | undefined;
		const data = {
			users: response.data,
			pagination: {
				totalCount: totalCount ? parseInt(totalCount) : response.data.length,
				pageSize: take ? parseInt(take) : 10,
				pageIndex:
					skip && take ? Math.floor(parseInt(skip) / parseInt(take)) : 0,
			},
		};
		console.log(data);

		return NextResponse.json(data);
	} catch (error: any) {
		console.error("Erreur lors de la récupération des utilisateurs:", error);
		const status = error.response?.status || 500;
		const message =
			error.response?.data?.message ||
			"Erreur lors de la récupération des utilisateurs";
		return NextResponse.json({ error: message }, { status });
	}
}

// POST /api/users
export async function POST(request: NextRequest) {
	try {
		// Récupérer le token d'authentification depuis les cookies
		const token = request.cookies.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Token d'authentification manquant" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		console.log(
			"Données envoyées au backend pour création d'utilisateur système:",
			body
		);

		// Appeler la route backend pour créer un utilisateur système
		const backendUrl =
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
		const response = await fetch(`${backendUrl}/users`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			console.error("Réponse non-JSON du backend:", await response.text());
			return NextResponse.json(
				{ error: "Réponse invalide du serveur backend" },
				{ status: 500 }
			);
		}

		const data = await response.json();
		console.log("Réponse du backend pour création d'utilisateur:", data);

		if (!response.ok) {
			// Améliorer les messages d'erreur
			let errorMessage =
				data.message || `Erreur ${response.status}: ${response.statusText}`;

			// Messages d'erreur plus parlants
			if (response.status === 400) {
				if (data.message?.includes("email")) {
					errorMessage = "Cette adresse email est déjà utilisée";
				} else if (data.message?.includes("password")) {
					errorMessage =
						"Le mot de passe ne respecte pas les critères de sécurité";
				} else if (data.message?.includes("role")) {
					errorMessage = "Le rôle sélectionné n'est pas valide";
				} else {
					errorMessage = "Les données fournies sont incomplètes ou incorrectes";
				}
			} else if (response.status === 401) {
				errorMessage =
					"Vous n'avez pas les permissions pour créer des utilisateurs système";
			} else if (response.status === 403) {
				errorMessage = "Accès refusé - permissions insuffisantes";
			} else if (response.status === 409) {
				errorMessage = "Un utilisateur avec cette adresse email existe déjà";
			}

			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Erreur lors de la création d'utilisateur système:", error);
		return NextResponse.json(
			{ error: "Erreur de connexion au serveur backend" },
			{ status: 500 }
		);
	}
}

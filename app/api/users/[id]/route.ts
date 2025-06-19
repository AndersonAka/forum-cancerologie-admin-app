import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// GET /api/users/[id]
export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const response = await axios.get(`${API_URL}/users/${params.id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Erreur lors de la récupération de l'utilisateur:", error);
		const status = error.response?.status || 500;
		const message =
			error.response?.data?.message ||
			"Erreur lors de la récupération de l'utilisateur";
		return NextResponse.json({ error: message }, { status });
	}
}

// PUT /api/users/[id]
export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const data = await request.json();
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const response = await axios.put(`${API_URL}/users/${params.id}`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Erreur lors de la modification de l'utilisateur:", error);
		const status = error.response?.status || 500;
		const message =
			error.response?.data?.message ||
			"Erreur lors de la modification de l'utilisateur";
		return NextResponse.json({ error: message }, { status });
	}
}

// PATCH /api/users/[id]
export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const data = await request.json();
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		console.log(`Modification de l'utilisateur ${params.id}:`, data);

		const response = await axios.patch(`${API_URL}/users/${params.id}`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		console.log("Réponse du backend (PATCH):", response.data);
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error(
			"Erreur lors de la modification de l'utilisateur (PATCH):",
			error
		);
		console.error("Détails de l'erreur:", {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		});

		const status = error.response?.status || 500;
		let message =
			error.response?.data?.message ||
			"Erreur lors de la modification de l'utilisateur";

		// Améliorer les messages d'erreur
		if (status === 400) {
			if (message.includes("email")) {
				message = "Cette adresse email est déjà utilisée";
			} else if (message.includes("password")) {
				message = "Le mot de passe ne respecte pas les critères de sécurité";
			} else if (message.includes("role")) {
				message = "Le rôle sélectionné n'est pas valide";
			} else if (message.includes("required")) {
				message = "Tous les champs obligatoires doivent être remplis";
			} else {
				message = "Les données fournies sont incomplètes ou incorrectes";
			}
		} else if (status === 401) {
			message = "Session expirée - veuillez vous reconnecter";
		} else if (status === 403) {
			message = "Vous n'avez pas les permissions pour modifier cet utilisateur";
		} else if (status === 404) {
			message = "Utilisateur introuvable";
		} else if (status === 409) {
			message = "Un utilisateur avec cette adresse email existe déjà";
		} else if (status === 422) {
			message = "Les données fournies ne respectent pas le format attendu";
		} else if (status === 500) {
			message = "Erreur interne du serveur - veuillez réessayer plus tard";
		}

		return NextResponse.json({ error: message }, { status });
	}
}

// DELETE /api/users/[id]
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const response = await axios.delete(`${API_URL}/users/${params.id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Erreur lors de la suppression de l'utilisateur:", error);
		const status = error.response?.status || 500;
		const message =
			error.response?.data?.message ||
			"Erreur lors de la suppression de l'utilisateur";
		return NextResponse.json({ error: message }, { status });
	}
}

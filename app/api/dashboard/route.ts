import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

// Marquer la route comme dynamique
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token");

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const response = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
			{
				headers: {
					Authorization: `Bearer ${token.value}`,
				},
			}
		);

		return NextResponse.json(response.data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des données" },
			{ status: 500 }
		);
	}
}

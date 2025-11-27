import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Marquer la route comme dynamique
export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token");

		if (!token || !token.value) {
			return NextResponse.json(
				{ error: "Token d'authentification manquant" },
				{ status: 401 }
			);
		}

		// Récupérer les paramètres de pagination
		const { searchParams } = new URL(request.url);
		const skip = searchParams.get("skip");
		const take = searchParams.get("take");

		// Construire l'URL avec les paramètres de pagination si disponibles
		let url = `${API_URL}/page-visits/all-with-users`;
		const params = new URLSearchParams();
		if (skip) params.append("skip", skip);
		if (take) params.append("take", take);
		if (params.toString()) {
			url += `?${params.toString()}`;
		}

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token.value}`,
				"Content-Type": "application/json",
			},
		});

		// Fonction pour filtrer la page d'accueil "/"
		const filterHomePage = (visits: any[]) => {
			return visits.filter((visit) => {
				const pageUrl = visit.pageUrl || visit.url || "";
				return pageUrl !== "/" && pageUrl !== "";
			});
		};

		// Le backend retourne maintenant une structure avec data et pagination
		// Si c'est déjà la nouvelle structure, filtrer et retourner
		if (response.data && typeof response.data === "object" && "data" in response.data && "pagination" in response.data) {
			const filteredData = filterHomePage(response.data.data);
			return NextResponse.json({
				data: filteredData,
				pagination: {
					...response.data.pagination,
					total: response.data.pagination.total - (response.data.data.length - filteredData.length),
				},
			});
		}

		// Si c'est un tableau (ancienne structure), filtrer et formater en nouvelle structure
		if (Array.isArray(response.data)) {
			const filteredData = filterHomePage(response.data);
			const totalCount = response.headers["x-total-count"] as string | undefined;
			const originalTotal = totalCount ? parseInt(totalCount) : response.data.length;
			const filteredTotal = originalTotal - (response.data.length - filteredData.length);
			
			const data = {
				data: filteredData,
				pagination: {
					total: filteredTotal,
					skip: skip ? parseInt(skip) : 0,
					take: take ? parseInt(take) : filteredData.length,
					hasMore: filteredTotal > (take ? parseInt(take) : filteredData.length),
				},
			};
			return NextResponse.json(data);
		}

		// Retourner la réponse telle quelle (déjà formatée) - avec filtre si c'est un tableau
		if (Array.isArray(response.data)) {
			const filteredData = filterHomePage(response.data);
			return NextResponse.json(filteredData);
		}

		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Erreur lors de la récupération des visites de pages:", error);

		// Si c'est une erreur axios avec une réponse du serveur
		if (error.response) {
			const status = error.response.status;
			const message =
				error.response.data?.message ||
				error.response.data?.error ||
				"Erreur lors de la récupération des visites de pages";

			// Propager le statut d'erreur du backend (401, 403, etc.)
			return NextResponse.json({ error: message }, { status });
		}

		// Erreur réseau ou autre
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des visites de pages" },
			{ status: 500 }
		);
	}
}


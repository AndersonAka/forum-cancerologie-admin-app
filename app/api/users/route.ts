import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

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
export async function POST(request: Request) {
	try {
		const data = await request.json();
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		const response = await axios.post(`${API_URL}/users`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Erreur lors de la création de l'utilisateur:", error);
		const status = error.response?.status || 500;
		const message =
			error.response?.data?.message ||
			"Erreur lors de la création de l'utilisateur";
		return NextResponse.json({ error: message }, { status });
	}
}

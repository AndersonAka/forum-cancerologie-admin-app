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

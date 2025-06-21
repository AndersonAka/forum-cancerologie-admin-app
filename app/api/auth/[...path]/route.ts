import { NextRequest, NextResponse } from "next/server";

const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://cancerologie-api.onrender.com";

export async function POST(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	try {
		const path = params.path.join("/");
		const body = await request.json();
		const response = await fetch(`${API_URL}/auth/${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		const data = await response.json();
		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Une erreur est survenue" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } }
) {
	try {
		const path = params.path.join("/");
		const response = await fetch(`${API_URL}/auth/${path}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Une erreur est survenue" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 }
		);
	}
}

import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://cancerologie-api.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Données envoyées au backend:", body);
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Réponse non-JSON du backend:", await response.text());
      return NextResponse.json(
        { error: "Réponse invalide du serveur" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Réponse du backend Nest.js:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.message || "Une erreur est survenue lors de l'inscription",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

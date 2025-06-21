import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/register"];

function parseJwt(token: string): any {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join("")
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		return null;
	}
}

export function middleware(request: NextRequest) {
	const token = request.cookies.get("auth_token")?.value;
	const { pathname } = request.nextUrl;

	// Vérifier si la route est protégée
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);
	const isAuthPage = authRoutes.includes(pathname);

	// Si l'utilisateur est connecté
	if (token) {
		let role = null;
		const payload = parseJwt(token);
		if (payload && payload.role) {
			role = payload.role;
		}

		// Bloquer les participants sur les routes protégées
		if (isProtectedRoute && role === "USER") {
			const url = new URL("/login", request.url);
			url.searchParams.set("error", "access-denied");
			return NextResponse.redirect(url);
		}

		// Rediriger vers le dashboard si sur une page d'authentification
		if (isAuthPage) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		// Autoriser l'accès à toutes les routes si connecté
		return NextResponse.next();
	}

	// Si l'utilisateur n'est pas connecté
	// Rediriger vers la connexion si c'est une route protégée
	if (isProtectedRoute) {
		const url = new URL("/login", request.url);
		url.searchParams.set("from", pathname);
		return NextResponse.redirect(url);
	}

	// Autoriser l'accès aux pages publiques
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

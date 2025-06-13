import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
	const token = request.cookies.get("auth_token")?.value;
	const { pathname } = request.nextUrl;

	console.log("Middleware - Pathname:", pathname);
	console.log("Middleware - Token présent:", !!token);

	// Vérifier si la route est protégée
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);
	const isAuthPage = authRoutes.includes(pathname);

	console.log("Middleware - Route protégée:", isProtectedRoute);
	console.log("Middleware - Page d'auth:", isAuthPage);

	// Si l'utilisateur est connecté
	if (token) {
		// Rediriger vers le dashboard si sur une page d'authentification
		if (isAuthPage) {
			console.log(
				"Middleware - Redirection vers /dashboard (utilisateur connecté)"
			);
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
		// Autoriser l'accès à toutes les routes si connecté
		return NextResponse.next();
	}

	// Si l'utilisateur n'est pas connecté
	// Rediriger vers la connexion si c'est une route protégée
	if (isProtectedRoute) {
		console.log(
			"Middleware - Redirection vers /login (utilisateur non connecté)"
		);
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

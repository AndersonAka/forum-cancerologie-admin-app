import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default function Page() {
	const cookieStore = cookies();
	const token = cookieStore.get("auth_token");

	if (!token) {
		redirect("/login");
	}

	redirect("/dashboard");
}

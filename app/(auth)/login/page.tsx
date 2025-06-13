import { LoginForm } from "components/Auth/LoginForm";
import { Suspense } from "react";

export default function Login() {
	return (
		<Suspense fallback={<div>Chargement...</div>}>
			<LoginForm />
		</Suspense>
	);
}

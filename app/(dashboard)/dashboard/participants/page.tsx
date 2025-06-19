import { Metadata } from "next";
import ParticipantPage from "components/Dashboard/participants/ParticipantPage";

export const metadata: Metadata = {
	title: "Participants",
	description: "Participants",
	robots: {
		index: false,
		follow: false,
	},
};

export default function ParticipantsPage() {

	return (
		<>
			<ParticipantPage />
		</>
	);
}

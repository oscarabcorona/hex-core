import { Attachment } from "../../components/ui";

export function AttachmentDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<Attachment
				file={{
					name: "design-spec.pdf",
					size: 248_512,
					type: "application/pdf",
				}}
			/>
			<Attachment
				file={{
					name: "report.csv",
					size: 12_400,
					type: "text/csv",
				}}
				progress={0.64}
			/>
			<Attachment
				file={{
					name: "screenshot.png",
					size: 184_320,
					type: "image/png",
				}}
			/>
		</div>
	);
}

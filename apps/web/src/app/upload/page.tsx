import UploadForm from "../../components/upload/upload-form";

export default function UploadPage() {
	return (
		<div className="container mx-auto py-10">
			<h1 className="mb-4 font-bold text-3xl">Upload a Video</h1>
			<UploadForm />
		</div>
	);
}

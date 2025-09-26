import UploadForm from "../../components/upload/upload-form";

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Upload a Video</h1>
      <UploadForm />
    </div>
  );
}

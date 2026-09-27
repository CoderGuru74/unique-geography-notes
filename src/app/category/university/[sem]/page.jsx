import SemesterClient from "./SemesterClient";

export function generateStaticParams() {
  return [
    { sem: "sem-1" },
    { sem: "ug-1" },
    { sem: "sem-2" },
    { sem: "ug-2" },
    { sem: "sem-3" },
    { sem: "ug-3" },
    { sem: "sem-4" },
    { sem: "ug-4" },
  ];
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <SemesterClient semKey={resolvedParams?.sem || "sem-1"} />;
}
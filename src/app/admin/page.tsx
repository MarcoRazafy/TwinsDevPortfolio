import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAdmin } from "@/lib/admin/auth";
import { getContent } from "@/lib/content/store";

/** /admin — tableau de bord. La session (cookie) se lit derrière un Suspense, comme l'exige cacheComponents. */
export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-white/60">
          <LoaderCircle size={18} className="animate-spin" aria-hidden />
          Chargement…
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const content = await getContent();
  return <AdminDashboard username={admin.username} content={content} />;
}

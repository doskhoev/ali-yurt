import type { Metadata } from "next";
import { HomeRedirect } from "@/components/HomeRedirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Али-Юрт",
  description: "Справочник жителя села Али-Юрт: новости, интересные места и объявления.",
  alternates: {
    canonical: "/news",
  },
  openGraph: {
    title: "Али-Юрт",
    description: "Справочник жителя села Али-Юрт: новости, интересные места и объявления.",
    url: "/news",
  },
};

export default function Home() {
  return <HomeRedirect />;
}

import { headers } from "next/headers";
import { SiteHeader } from "./SiteHeader";

export async function ConditionalHeader() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Не показываем header на странице установки username
  if (pathname === "/setup-username") {
    return null;
  }
  
  return <SiteHeader />;
}

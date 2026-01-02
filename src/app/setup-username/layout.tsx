// Layout для страницы установки username
// Переопределяет root layout, не показывает SiteHeader

export default function SetupUsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


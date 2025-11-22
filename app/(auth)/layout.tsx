export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      {children}
    </div>
  );
}


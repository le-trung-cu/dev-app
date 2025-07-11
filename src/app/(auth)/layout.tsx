import { Toaster } from "sonner";
import "./globals.css"
import { Providers } from "@/components/providers/provider";
interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
          <Providers>
            <div className="w-full max-w-sm md:max-w-3xl">{children}</div>
          </Providers>
        </div>
      </body>
    </html>
  );
};

export default Layout;

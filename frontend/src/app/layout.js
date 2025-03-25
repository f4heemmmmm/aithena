import "./globals.css";
import NavigationBar from "@/components/NavigationBar";

export const metadata = {
    title: 'AITHENA',
    description: 'AI-powered assistance for legal professionals',
};

export default function RootLayout({ children }) {
    return (
        <html lang = "en">
            <body className = "min-h-screen">
                <header>
                    <NavigationBar />
                </header>
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
};
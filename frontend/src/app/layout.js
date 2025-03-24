export const metadata = {
    title: "AITHENA | Legal AI Assistant",
    description: "AI-powered assistance for legal professionals",
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body className="min-h-screen">
          <header>
            <Navbar />
          </header>
          <main>
            {children}
          </main>
        </body>
      </html>
    );
  }
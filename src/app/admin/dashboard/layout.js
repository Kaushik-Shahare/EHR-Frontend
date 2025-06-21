

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 text-gray-900">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
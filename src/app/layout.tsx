import Link from "next/link";
import prisma from "../../lib/prisma";
import "./global.css";
import styles from "./styles.module.css";

export const metadata = {
  title: "Home",
  description: "yay",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const numQuotes = await prisma.quotation.count();
  const quoteId = Math.floor(Math.random() * numQuotes);
  const randomQuote = await prisma.quotation.findFirst({
    where: { id: quoteId },
  });
  return (
    <html lang="en">
      <body>
        <div id={styles.nav}>
          <Link href="/">
            <h1>rovq️</h1>
          </Link>
          <p id={styles.randomQuotation}>{randomQuote?.text}</p>
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}

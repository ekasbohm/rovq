import prisma from "../../lib/prisma";
import Book from "../../components/book";

export default async function Home() {
  const books = await prisma.book.findMany({ include: { authors: true } });
  return (
    <main>
      <h1>Books</h1>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {books.map((book) => (
          <Book book={book} key={book.id} />
        ))}
      </div>
    </main>
  );
}

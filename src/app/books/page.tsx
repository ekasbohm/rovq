import prisma from "@lib/prisma";
import BookList from "@components/BookList";

export default async function Books() {
  const books = await prisma.book.findMany({ include: { authors: true } });
  return <BookList books={books} title="Books" />;
}

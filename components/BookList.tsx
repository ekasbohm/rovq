import BookThumbnail from "./BookThumbnail";
import styles from "./styles.module.css";
import { Author, Book } from "@prisma/client";

export default async function BookList({
  title,
  books,
}: {
  title: string;
  books: (Book & { authors: Author[] })[];
}) {
  return (
    <>
      <h2>{title}</h2>
      <div id={styles.booksWrapper}>
        {books.map((book) => (
          <BookThumbnail book={book} key={book.id} />
        ))}
      </div>
    </>
  );
}

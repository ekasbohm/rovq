import Image from "next/image";
import Link from "next/link";
import { Author, Book } from "@prisma/client";
import styles from "./styles.module.css";

export default async function BookThumbnail({
  book,
}: {
  book: Book & { authors: Author[] };
}) {
  return (
    <div className={styles.book}>
      <Link href={`/books/${book.id}`}>
        <div id={styles.cover}>
          {book.cover_url && (
            <Image
              src={book.cover_url}
              alt={`${book.title} cover`}
              fill
              id={styles.coverImage}
            />
          )}
        </div>
      </Link>
      <div id={styles.content}>
        <Link href={`/books/${book.id}`} id={styles.bookTitle}>
          <h3>{book.title}</h3>
        </Link>
        {book.authors.map((author: Author) => (
          <p key={author.id}>
            <Link href={`/authors/${author.id}`}>{author.name}</Link>
          </p>
        ))}
      </div>
    </div>
  );
}

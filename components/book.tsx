import { Author, Book } from "@prisma/client";
import Image from "next/image";

export default async function Book({
  book,
}: {
  book: Book & { authors: Author[] };
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "300px" }}>
      {book.cover_url && (
        <Image
          src={book.cover_url}
          alt={`${book.title} cover`}
          width={150}
          height={200}
        />
      )}
      <h2>{book.title}</h2>
      <p>{book.authors.map((author: Author) => author.name).join(",")}</p>
      {Object.entries(book).map(
        ([key, value]) =>
          value && (
            <p key={key}>
              <b>{key}</b>: {`${value}`}
            </p>
          )
      )}
    </div>
  );
}

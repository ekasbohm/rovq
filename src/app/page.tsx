import Link from "next/link";
import Image from "next/image";
import prisma from "@lib/prisma";
import styles from "./styles.module.css";

export default async function Covers() {
  const covers = await prisma.book.findMany({
    where: { cover_url: { not: null } },
  });
  return (
    <div id={styles.wrapper}>
      {covers.map(({ id, title, cover_url }) => (
        <Link href={`/books/${id}`} key={id}>
          <Image
            alt={`${title} cover`}
            src={cover_url as string}
            width={75}
            height={100}
          />
        </Link>
      ))}
    </div>
  );
}

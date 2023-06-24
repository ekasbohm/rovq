import prisma from "@lib/prisma";
import styles from "./styles.module.css";

export default async function CommonplaceBook() {
  const quotations = await prisma.quotation.findMany();
  return (
    <div id={styles.wrapper}>
      {quotations.map(({ id, text }) => (
        <div key={id} id={styles.item}>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

import Image from "next/image";
import prisma from "@lib/prisma";
import styles from "./styles.module.css";
import Link from "next/link";

export default async function Book({ params }: { params: { id: string } }) {
  const book = await prisma.book.findFirstOrThrow({
    where: { id: parseInt(params.id, 10) },
    include: { authors: true, quotations: true, genres: true, tropes: true },
  });
  const {
    title,
    authors,
    quotations,
    cover_url: coverUrl,
    started_reading: started,
    finished_reading: finished,
    publication_year: publicationYear,
    collectionName,
    formatName,
    hero_rating: hero,
    heroine_rating: heroine,
    premise_rating: premise,
    overall_rating: overall,
    writing_rating: writing,
    due,
    epigraph,
    recommendation,
    recommenderName,
    seriesTitle,
    statusName: status,
    genres,
    tropes,
  } = book;

  const featuredQuotation = quotations.find(({ featured }) => featured);

  return (
    <>
      <div id={styles.summary}>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={`${title} cover`}
            width="150"
            height="200"
          />
        )}
        <div id={styles.metadata}>
          <h2>{title}</h2>
          <p>
            {authors.map(({ id, name }) => (
              <Link href={`/authors/${id}`} key={id}>
                {name}
              </Link>
            ))}
            {publicationYear && ` | ${publicationYear}`}
            {seriesTitle && ` | ${seriesTitle}`} | {formatName} |{" "}
            {collectionName}
          </p>
          <p>
            {genres.map(({ id, name }) => (
              <Link href={`/genres/${id}`} key={id}>
                {name}
              </Link>
            ))}
          </p>
          <p>
            {tropes.map(({ id, name }) => (
              <Link href={`/tropes/${id}`} key={id}>
                {name}
              </Link>
            ))}
          </p>
          <p>
            {overall && <span>Overall {overall}</span>}
            {premise && <span>Premise {premise}</span>}
            {writing && <span>Writing {writing}</span>}
            {hero && <span>Hero {hero}</span>}
            {heroine && <span>Heroine {heroine}</span>}
          </p>
          {recommendation && recommenderName && (
            <p>
              Recommended by {recommenderName}: {recommendation}
            </p>
          )}
          <p>
            {status} {due && `| ${due.toLocaleDateString()}`}
            {status === "Read" &&
              started &&
              finished &&
              `${started.toLocaleDateString()} - ${finished.toLocaleDateString()}`}
          </p>
        </div>
        {featuredQuotation && (
          <div id={styles.featuredQuotation}>
            <p>{quotations.find(({ featured }) => featured)?.text}</p>
          </div>
        )}
      </div>
      {epigraph && <p id={styles.epigraph}>{epigraph}</p>}
      {quotations.map(({ id, text }) => (
        <p key={id}>{text}</p>
      ))}
    </>
  );
}

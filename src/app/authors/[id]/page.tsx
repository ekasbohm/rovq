import prisma from "@lib/prisma";
import BookList from "@components/BookList";

export default async function Author({ params }: { params: { id: string } }) {
  const author = await prisma.author.findFirstOrThrow({
    where: { id: parseInt(params.id, 10) },
    include: { books: { include: { authors: true } } },
  });
  const { id, name, books } = author;
  const avgRatings = await prisma.book.aggregate({
    _avg: {
      overall_rating: true,
      hero_rating: true,
      heroine_rating: true,
      writing_rating: true,
      premise_rating: true,
    },
    where: { authors: { some: { id } } },
  });
  const {
    _avg: {
      overall_rating: overall,
      hero_rating: hero,
      heroine_rating: heroine,
      premise_rating: premise,
      writing_rating: writing,
    },
  } = avgRatings;

  const averageRatings = {
    Overall: overall,
    Writing: writing,
    Premise: premise,
    Hero: hero,
    Heroine: heroine,
  };

  return (
    <>
      <h2>{name}</h2>
      <ul>
        <li>
          <b>Read</b>:{" "}
          {books.filter(({ statusName }) => statusName === "Read").length}
        </li>
        <li>
          <b>Reading</b>:{" "}
          {books.filter(({ statusName }) => statusName === "Reading").length}
        </li>
        <li>
          <b>To Read</b>:{" "}
          {
            books.filter(({ statusName }) =>
              ["Wish List", "On Hold", "Borrowed"].includes(statusName)
            ).length
          }
        </li>
        {Object.entries(averageRatings)
          .filter(([_, value]) => !!value)
          .map(([category, rating]) => (
            <li key={category}>
              <b>Average {category}</b>: {rating?.toFixed(5)}
            </li>
          ))}
      </ul>
      <BookList books={books} title="Books" />
    </>
  );
}

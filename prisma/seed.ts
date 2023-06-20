import {
  Client,
  isFullBlock,
  isFullPage,
  iteratePaginatedAPI,
} from "@notionhq/client";
import { prisma } from "../lib/prisma";
import { Book } from "@prisma/client";

const notion = new Client({ auth: process.env.NOTION_SECRET });

async function getQuotations(pageId: string) {
  const quotations: { text: string; featured: boolean }[] = [];
  const blockResponse = await notion.blocks.children.list({
    block_id: pageId,
  });
  await Promise.all(
    blockResponse.results.map(async (result) => {
      if (isFullBlock(result) && result.type === "callout") {
        quotations.push({
          text: result.callout.rich_text
            .map((text) => text.plain_text)
            .join(""),
          featured: true,
        });
      } else if (isFullBlock(result) && result.type === "bulleted_list_item") {
        const quotation = result.bulleted_list_item.rich_text.map(
          (text) => text.plain_text
        );
        if (result.has_children) {
          const childrenResponse = await notion.blocks.children.list({
            block_id: result.id,
          });
          childrenResponse.results.forEach((result) => {
            if (isFullBlock(result) && result.type === "bulleted_list_item") {
              const subQuotation = result.bulleted_list_item.rich_text.map(
                (text) => text.plain_text
              );
              quotation.push(...subQuotation);
            }
          });
        }
        quotations.push({
          text: quotation.join(" "),
          featured: false,
        });
      }
    })
  );

  return quotations;
}

async function main() {
  ["Audiobook", "Ebook", "Hardcover", "Paperback"].forEach(
    async (name) => await prisma.format.create({ data: { name } })
  );
  for await (const book of iteratePaginatedAPI(notion.databases.query, {
    database_id: process.env.NOTION_DATABASE_ID ?? "",
  })) {
    if (isFullPage(book)) {
      const { cover, properties } = book;
      const {
        Title,
        "Hero Rating": heroRating,
        "Heroine Rating": heroineRating,
        "Writing Rating": writingRating,
        "Premise Rating": premiseRating,
        "Overall Rating": overallRating,
        "Publication Year": publicationYear,
        Due,
        Read,
        Epigraph,
        Recommendation,
      } = properties;
      const title =
        Title.type === "title" &&
        Title.title.map((part) => part.plain_text).join("");
      const hero_rating = heroRating.type === "number" && heroRating.number;
      const heroine_rating =
        heroineRating.type === "number" && heroineRating.number;
      const premise_rating =
        premiseRating.type === "number" && premiseRating.number;
      const writing_rating =
        writingRating.type === "number" && writingRating.number;
      const overall_rating =
        overallRating.type === "number" && overallRating.number;
      const publication_year =
        publicationYear.type === "number" && publicationYear.number;
      const due = Due.type === "date" && Due.date && new Date(Due.date.start);
      const started_reading =
        Read.type === "date" && Read.date && new Date(Read.date.start);
      const finished_reading =
        Read.type === "date" &&
        Read.date &&
        properties.Status.type === "status" &&
        properties.Status.status?.name === "Read"
          ? new Date(Read.date.end || Read.date.start)
          : null;
      const epigraph =
        Epigraph.type === "rich_text" &&
        Epigraph.rich_text.map((text) => text.plain_text).join("");
      const recommendation =
        Recommendation.type === "rich_text" &&
        Recommendation.rich_text.map((text) => text.plain_text).join("");
      const cover_url = cover?.type === "external" ? cover.external.url : null;
      let bookToCreate = {
        title,
        hero_rating,
        heroine_rating,
        premise_rating,
        writing_rating,
        overall_rating,
        publication_year,
        due,
        started_reading,
        finished_reading,
        epigraph,
        recommendation,
        cover_url,
        format: {
          connectOrCreate: {
            create: { name: "Ebook" },
            where: { name: "Ebook" },
          },
        },
      } as unknown as Book;
      if (properties.Status.type === "status") {
        const name = properties.Status.status?.name;
        Object.assign(bookToCreate, {
          status: { connectOrCreate: { where: { name }, create: { name } } },
        });
      }
      if (properties["Recommended by"].type === "select") {
        const recommender = properties["Recommended by"].select?.name;
        if (recommender) {
          Object.assign(bookToCreate, {
            recommended_by: {
              connectOrCreate: {
                where: { name: recommender },
                create: { name: recommender },
              },
            },
          });
        }
      }
      if (properties.Collection.type === "multi_select") {
        const collection = properties.Collection.multi_select;
        if (collection.length > 0) {
          const [{ name }] = collection;
          Object.assign(bookToCreate, {
            collection: {
              connectOrCreate: { where: { name }, create: { name } },
            },
          });
        }
      }
      if (properties.Series.type === "select") {
        const series = properties.Series.select;
        if (series) {
          const { name: title } = series;
          Object.assign(bookToCreate, {
            series: {
              connectOrCreate: { where: { title }, create: { title } },
            },
          });
        }
      }
      if (properties.Tropes.type === "multi_select") {
        const tropeNames = properties.Tropes.multi_select.map(
          ({ name }) => name
        );
        Object.assign(bookToCreate, {
          tropes: {
            connectOrCreate: tropeNames.map((name) => ({
              create: { name },
              where: { name },
            })),
          },
        });
      }
      if (properties.Genre.type === "multi_select") {
        const genreNames = properties.Genre.multi_select.map(
          ({ name }) => name
        );
        Object.assign(bookToCreate, {
          genres: {
            connectOrCreate: genreNames.map((name) => ({
              create: { name },
              where: { name },
            })),
          },
        });
      }
      if (properties.Author.type === "multi_select") {
        const authorNames = properties.Author.multi_select.map(
          ({ name }) => name
        );
        Object.assign(bookToCreate, {
          authors: {
            connectOrCreate: authorNames.map((name) => ({
              create: { name },
              where: { name },
            })),
          },
        });
      }

      const quotations = await getQuotations(book.id);

      Object.assign(bookToCreate, {
        quotations: {
          connectOrCreate: quotations.map((quotation) => ({
            create: quotation,
            where: { text: quotation.text },
          })),
        },
      });
      await prisma.book.create({ data: bookToCreate });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

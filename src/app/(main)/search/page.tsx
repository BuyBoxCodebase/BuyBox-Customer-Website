import { readSearchParams, searchProducts, searchUrl } from "@/lib/search";
import SearchResultsView from "@/components/search/SearchResultsView";

// Rendered on the server: the first page of results arrives with the HTML.
// Filters live in the URL, so back/forward, refresh and sharing all work.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = readSearchParams(await searchParams);
  const result = await searchProducts(params).catch((error) => {
    console.error("Search failed", error);
    return null;
  });

  return <SearchResultsView key={searchUrl(params)} params={params} initialResult={result} />;
}

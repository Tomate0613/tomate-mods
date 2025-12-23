import { SearchResult } from 'tomate-mods';
import { loader } from 'tomate-loaders';
import { tomateMods } from './setup';
import { modpack } from './stub';

async function search(query: string) {
  let searchResults: SearchResult[] = [];
  const providerIds = ['modrinth', 'curseforge'] as const;
  const modLoader = loader(modpack.loader.id).tomateModsModLoader;

  for (const providerId of providerIds) {
    try {
      const provider = tomateMods.provider(providerId);

      const queryParams = provider
        .searchQueryParamsBuilder()
        .query(query)
        .loader(modLoader)
        .gameVersion(modpack.gameVersion)
        .mods()
        .toString();

      const searchResult = await provider.search(queryParams);

      searchResults.push(searchResult);
    } catch (e) {}
  }

  return tomateMods.mergeSearch({}, ...searchResults);
}

const searchResults = await search('fabric api');

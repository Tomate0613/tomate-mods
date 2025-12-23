import * as T from './types';

type Providers = T.ApiProvider[];
type ProviderId<T extends Providers> = T[number]['id'];

export class TomateMods<T extends Providers> {
  private providers: Record<ProviderId<T>, T.ApiProvider>;

  private constructor(providers: T.ApiProvider[]) {
    this.providers = Object.fromEntries(
      providers.map((p) => [p.id, p as never])
    ) as never;
  }

  static fromProviders<T extends Providers>(...providers: T) {
    return new TomateMods<T>(providers);
  }

  provider(provider: ProviderId<T>) {
    const p = this.providers[provider];

    if (!p) {
      throw new Error(
        `Unknown provider "${provider}". Did you forget to add it first?`
      );
    }

    return p;
  }

  getFilename(version: T.Version) {
    return version.files[0].filename;
  }

  mergeSearch(
    options: {
      dedupe?: typeof dedupeSearch;
    },
    ...searchResults: T.SearchResult[]
  ) {
    const mergedResults: T.SearchResult = {
      hits: [],
      count: 0,
    };

    for (const searchResult of searchResults) {
      mergedResults.count += searchResult.count;
      mergedResults.hits.push(...searchResult.hits);
    }

    mergedResults.hits = mergedResults.hits.filter((hit, idx) => {
      if (mergedResults.hits.find((options.dedupe ?? dedupeSearch)(hit, idx))) {
        mergedResults.count--;
        return false;
      }

      return true;
    });

    return mergedResults;
  }

  async fileVersion<K extends ProviderId<T>[]>(path: string, providerIds?: K) {
    const providers = providerIds
      ? providerIds.map(this.provider.bind(this))
      : (Object.values(this.providers) as T.ApiProvider[]);

    const results = await Promise.allSettled(
      providers.map((provider) =>
        provider.fileVersion(path).then(
          (version) =>
            ({
              provider: provider.id,
              version,
            }) as { provider: K[number]; version: T.Version }
        )
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        return result.value;
      }
    }
  }
}

function dedupeSearch(hit: T.SearchResultHit, idx: number) {
  return (_hit: T.SearchResultHit, _idx: number) =>
    idx > _idx &&
    (hit.slug === _hit.slug ||
      hit.name === _hit.name ||
      hit.description === _hit.description);
}

export * from './types';
export * from './curseforge';
export * from './modrinth';
export * from './utils/checkFile';
export * from './file';

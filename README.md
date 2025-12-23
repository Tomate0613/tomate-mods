# Tomate Mods

Tomate Mods is a common abstraction layer over the Modrinth and Curseforge api 

---

## Setup
```ts
import { CurseforgeProvider, ModrinthProvider, TomateMods } from 'tomate-mods';

export const tomateMods = TomateMods.fromProviders(
  new ModrinthProvider('doublekekse/tomate-mods'),
  new CurseforgeProvider(
    'doublekekse/tomate-mods',
    process.env.CURSEFORGE_API_KEY
  )
);
```

## Searching
Query parameters can be generated automatically (See [here](#query-parameters)) or manually specified
- https://docs.modrinth.com/api/operations/searchprojects/#query-parameters
- https://docs.curseforge.com/rest-api/#search-mods

```ts
const searchResult = await tomateMods.provider('modrinth').search(queryParams);
```

## Project
```ts
const boidsMod = await tomateMods.provider('modrinth').project('boids');
```

## Versions
### Get all versions
```ts
const versions = await tomateMods.provider('modrinth').versions('boids');
```

### Filtering versions
Query parameters can be generated automatically (See [here](#query-parameters)) or manually specified
- https://docs.modrinth.com/api/operations/getprojectversions/#query-parameters
- https://docs.curseforge.com/rest-api/#get-mod-files

```ts
const provider = tomateMods.provider('modrinth');
const versions = await provider.versions('boids', queryParams);
```


### Get a specific version by id
```ts
const version = await tomateMods
  .provider('modrinth')
  .version('boids', 'WKjzEyfQ');
```

## Downloading
```ts
const provider = tomateMods.provider('modrinth');

const version = await provider.version('boids', 'WKjzEyfQ');
await provider.download(version, './boids.jar');
```

Some CurseForge-hosted mods do not support direct API downloads. In these cases, you can specify a `popup` handler to open the mod's download page in a browser as a fallback.  
See the [electron popup example](./examples/popup.ts).

## Find version from file
```ts
const file = await tomateMods.fileVersion('./boids.jar');

if (file) {
  const { provider, version } = file;
}
```

## Query Parameters
```ts
import { fabric } from 'tomate-loaders';

const provider = tomateMods.provider('modrinth');

// For search
const searchQueryParameters = provider
  .searchQueryParamsBuilder()
  .query('boids')
  .gameVersion('1.21.1')
  .loader(fabric.tomateModsModLoader)
  .mods();

// For filtering versions
const versionQueryParameters = provider
  .versionQueryParamsBuilder()
  .gameVersion('1.21.1');
```

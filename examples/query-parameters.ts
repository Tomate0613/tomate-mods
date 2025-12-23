import { tomateMods } from 'setup';
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

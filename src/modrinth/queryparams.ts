import {
  ModLoaderPlatformInfo,
  ProjectType,
  SearchQueryParamsBuilder,
  VersionQueryParamsBuilder,
} from '../types';
import { toModrinthProjectType } from './mappings';

export class ModrinthSearchQueryParamsBuilder
  implements SearchQueryParamsBuilder
{
  private _query = '';
  private _facets: string[][] = [];
  private _limit = 10;
  private _offset = 0;
  private _index = 'relevance';

  query(query: string) {
    this._query = query;
    return this;
  }

  facet(type: string, op: string, values: string[]) {
    const facetGroup = values.map((v) => `${type}${op}${v}`);
    this._facets.push(facetGroup);
    return this;
  }

  gameVersions(versions: string[]): this {
    return this.facet('versions', ':', versions);
  }

  gameVersion(version: string): this {
    return this.gameVersions([version]);
  }

  categories(categories: string[]) {
    return this.facet('categories', ':', categories);
  }

  loader(loader: ModLoaderPlatformInfo) {
    return this.categories(loader.modrinthCategories);
  }

  mods() {
    return this.type('mod');
  }

  shaderpacks() {
    return this.type('shaderpack');
  }

  resourcepacks() {
    return this.type('resourcepack');
  }

  modpacks() {
    return this.type('modpack');
  }

  type(projectType: Exclude<ProjectType, 'other'>) {
    const t = toModrinthProjectType(projectType);

    if (!t) {
      throw new Error(`Modrinth does not support project type ${projectType}`);
    }

    return this.facet('project_type', ':', [t]);
  }

  limit(count: number) {
    this._limit = Math.min(count, 100);
    return this;
  }

  offset(index: number) {
    this._offset = index;
    return this;
  }

  toString() {
    const params = new URLSearchParams({
      query: this._query,
      index: this._index,
      offset: this._offset.toString(),
      limit: this._limit.toString(),
      facets: JSON.stringify(this._facets),
    });

    return params.toString();
  }
}

export class ModrinthVersionQueryParamsBuilder
  implements VersionQueryParamsBuilder
{
  _params = new URLSearchParams();

  gameVersions(versions: string[]) {
    this._params.set('game_versions', JSON.stringify(versions));
    return this;
  }

  gameVersion(version: string) {
    return this.gameVersions([version]);
  }

  loader(loader: ModLoaderPlatformInfo) {
    this._params.set('loaders', JSON.stringify(loader.modrinthCategories));
    return this;
  }

  featured(value = true) {
    this._params.set('featured', value.toString());
  }

  toString() {
    return this._params.toString();
  }
}

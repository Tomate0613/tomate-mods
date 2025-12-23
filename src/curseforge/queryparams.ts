import {
  ModLoaderPlatformInfo,
  ProjectType,
  SearchQueryParamsBuilder,
  VersionQueryParamsBuilder,
} from '../types';
import { GAME_ID_MINECRAFT, operations, toClassId } from './mappings';

type StringValues<T> = {
  [K in keyof T]: T[K] extends undefined ? string | undefined : string;
};
type SearchParameters = StringValues<
  operations['searchMods']['parameters']['query']
> & { class?: string };
type VersionParameters = StringValues<
  NonNullable<operations['getModFiles']['parameters']['query']>
>;

export class CurseforgeSearchQueryParamsBuilder
  implements SearchQueryParamsBuilder
{
  _parmeters: SearchParameters = {
    gameId: GAME_ID_MINECRAFT,
    pageSize: '10',
    index: '0',
  };

  query(query: string) {
    this._parmeters.searchFilter = query;
    return this;
  }

  gameVersions(versions: string[]) {
    this._parmeters.gameVersions = JSON.stringify(versions);
    return this;
  }

  gameVersion(version: string) {
    this._parmeters.gameVersion = version;
    return this;
  }

  loader(loader: ModLoaderPlatformInfo) {
    // this._parmeters.modLoaderType = loader.curseforgeCategory;
    this._parmeters.gameVersionTypeId = loader.curseforgeCategory;
    return this;
  }

  type(projectType: Exclude<ProjectType, 'other'>) {
    this._parmeters.classId = toClassId(projectType).toString();
    return this;
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

  plugins() {
    return this.type('plugin');
  }

  datapacks() {
    return this.type('datapack');
  }

  limit(count: number) {
    this._parmeters.pageSize = count.toString();
    return this;
  }

  offset(index: number) {
    this._parmeters.index = index.toString();
    return this;
  }

  toString() {
    return new URLSearchParams(this._parmeters).toString();
  }
}

export class CurseforgeVersionQueryParamsBuilder
  implements VersionQueryParamsBuilder
{
  _parmeters: VersionParameters = {};

  gameVersion(version: string) {
    this._parmeters.gameVersion = version;
    return this;
  }

  loader(loader: ModLoaderPlatformInfo) {
    this._parmeters.modLoaderType = loader.curseforgeCategory;
    return this;
  }

  limit(count: number) {
    this._parmeters.pageSize = count.toString();
    return this;
  }

  offset(index: number) {
    this._parmeters.index = index.toString();
    return this;
  }

  toString() {
    return new URLSearchParams(this._parmeters).toString();
  }
}

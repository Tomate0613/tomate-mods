import { projectTypes, implementedProviders } from "./values";

export type ImplementedProvider = (typeof implementedProviders)[number];

export type Provider = ImplementedProvider | 'custom';

export type ModLoaderPlatformInfo = {
  modrinthCategories: string[];
  curseforgeCategory: string;
};

export interface SearchQueryParamsBuilder {
  query(query: string): this;

  gameVersions(versions: string[]): this;
  gameVersion(version: string): this;

  loader(loader: ModLoaderPlatformInfo): this;

  mods(): this;
  shaderpacks(): this;
  modpacks(): this;
  resourcepacks(): this;
  limit(count: number): this;
  offset(index: number): this;

  toString(): string;
}

export interface VersionQueryParamsBuilder {
  gameVersion(version: string): this;
  loader(loader: ModLoaderPlatformInfo): this;

  toString(): string;
}

export type ProjectType = (typeof projectTypes)[number] | 'other';

export type Project = {
  id: string;
  slug: string;

  name: string;
  description: string;
  icon?: string;
  type?: ProjectType;

  latestVersions: string[];
};

export type VersionFile = {
  sha1?: string;
  url?: string;
  filename: string;
};

export type Dependency = {
  projectId?: string;
  versionId?: string;
  dependencyType:
    | 'required'
    | 'optional'
    | 'embedded'
    | 'incompatible'
    | 'tool';
};

export type Version = {
  id: string;
  projectId: string;

  name: string;
  type: 'alpha' | 'beta' | 'release';
  date: string;
  downloads: number;
  gameVersions: string[];
  loaders: string[];
  dependencies: Dependency[];

  files: VersionFile[];
};

export type DownloadPopup = (url: string, path: string) => void | Promise<void>;

export type SearchResultHit = {
  id: string;
  provider: 'modrinth' | 'curseforge';

  name: string;
  description: string;
  icon?: string;
  authors: string[];
  slug: string;
  url: string;
};

export type SearchResult = { hits: SearchResultHit[]; count: number };

export type DownloadOptions = {
  onProgress?: (progress: number) => void;
  /**
   * Filesize in bytes above which download progress is reported
   */
  minProgressSize?: number;
  popup?: DownloadPopup;
};

export type ApiProvider = {
  id: string;

  project(id: string): Promise<Project>;
  version(projectId: string, id: string): Promise<Version>;
  versions(
    projectId: string,
    queryParams?: string | VersionQueryParamsBuilder
  ): Promise<Version[]>;
  download(
    version: Version,
    path: string,
    downloadOptions?: DownloadOptions
  ): Promise<void>;
  fileVersion(path: string): Promise<Version>;
  search(queryParams: string | SearchQueryParamsBuilder): Promise<SearchResult>;

  searchQueryParamsBuilder(): SearchQueryParamsBuilder;
  versionQueryParamsBuilder(): VersionQueryParamsBuilder;
};

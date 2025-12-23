import ModrinthApi, { G, Schema } from './api';
import * as T from '../types';
import type { IncomingMessage } from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  ModrinthSearchQueryParamsBuilder,
  ModrinthVersionQueryParamsBuilder,
} from './queryparams';
import { toProjectType } from './mappings';

export class ModrinthProvider implements T.ApiProvider {
  private api: ModrinthApi;
  id = 'modrinth' as const;

  constructor(userAgent: string, apiKey?: string) {
    this.api = new ModrinthApi(userAgent, apiKey);
  }

  async project(id: string) {
    const { data: project } = await this.api.get<G<'/project/{}'>>(
      `/project/${id}`
    );

    return {
      id: project.id,
      slug: project.slug ?? project.id,

      name: project.title ?? 'Unknown',
      description: project.description ?? '',
      icon: project.icon_url ?? '',
      type: toProjectType(project.project_type),

      latestVersions: project.versions ?? [],
    };
  }

  private mapVersion(version: Schema<'Version'>) {
    return {
      id: version.id,
      projectId: version.project_id,

      name: version.name ?? 'Unknown',
      type: version.version_type ?? 'alpha',
      date: version.date_published,
      downloads: version.downloads,
      gameVersions: version.game_versions ?? [],
      loaders: version.loaders ?? [],

      dependencies: (version.dependencies ?? []).map((dependency) => ({
        projectId: dependency.project_id ?? undefined,
        versionId: dependency.version_id ?? undefined,
        dependencyType: dependency.dependency_type,
      })),

      files: version.files.map((version) => ({
        sha1: version.hashes['sha1'],
        url: version.url,
        filename: version.filename,
      })),
    };
  }

  async version(_projectId: string, id: string) {
    const { data: version } = await this.api.get<G<'/version/{}'>>(
      `/version/${id}`
    );

    return this.mapVersion(version);
  }

  async versions(
    projectId: string,
    queryParams?: string | T.VersionQueryParamsBuilder
  ): Promise<T.Version[]> {
    const { data: versions } = await this.api.get<G<'/project/{}/version'>>(
      `/project/${projectId}/version?${queryParams}`
    );

    return versions.map(this.mapVersion);
  }

  async download(
    version: T.Version,
    path: string,
    options?: T.DownloadOptions
  ) {
    const [file] = version.files;

    if (!file.url) {
      throw new Error('Version does not have a download url');
    }

    const { data } = await this.api.rawGet<IncomingMessage>(file.url, {
      responseType: 'stream',
    });
    const writeStream = fs.createWriteStream(path);
    data.pipe(writeStream);

    const totalBytes = Number(data.headers['content-length']);
    let downloadedBytes = 0;
    let previousReportedProgress = 0;

    if (
      options?.onProgress &&
      totalBytes &&
      totalBytes >= (options?.minProgressSize ?? 0)
    ) {
      data.on('data', (chunk) => {
        if (!(typeof chunk == 'object' && 'length' in chunk)) {
          return;
        }

        downloadedBytes += chunk.length;

        const progress = downloadedBytes / totalBytes;
        if (progress - previousReportedProgress < 0.1) {
          return;
        }

        previousReportedProgress = progress;
        if (options.onProgress) {
          options.onProgress(Math.max(Math.min(progress, 1), 0));
        }
      });
    }

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      data.on('error', reject);
    });
  }

  async fileVersion(path: string) {
    const modFile = fs.readFileSync(path);
    const modHash = crypto.createHash('sha1').update(modFile).digest('hex');

    const { data: version } = await this.api.get<G<'/version_file/{}'>>(
      `/version_file/${modHash}?algorithm=sha1`
    );

    return this.mapVersion(version);
  }

  async search(
    queryParams: string | T.SearchQueryParamsBuilder
  ): Promise<T.SearchResult> {
    const searchResult = await this.api.get<G<'/search'>>(
      `/search?${queryParams}`
    );

    return {
      hits: searchResult.data.hits.map((hit) => ({
        id: hit.project_id,
        provider: 'modrinth',
        url: `https://modrinth.com/${hit.project_type}/${hit.project_id}`,

        versions: hit.versions,

        name: hit.title ?? 'Unknown',
        description: hit.description ?? '',

        // We could load the whole team here (but I am not sure if this is a good idea?)
        authors: [hit.author],
        icon: hit.icon_url ?? undefined,
        slug: hit.slug ?? hit.project_id,
      })),

      count: searchResult.data.total_hits,
    };
  }

  async user(userId: string) {
    const { data } = await this.api.get<G<'/user/{}'>>(`/user/${userId}`);
    return data;
  }

  async userProjects(userId: string) {
    userId;
    const { data } = await this.api.get<G<'/user/{}/projects'>>(
      `/user/${userId}/projects`
    );
    return data;
  }

  searchQueryParamsBuilder() {
    return new ModrinthSearchQueryParamsBuilder();
  }

  versionQueryParamsBuilder() {
    return new ModrinthVersionQueryParamsBuilder();
  }
}

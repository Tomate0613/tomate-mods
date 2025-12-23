import axios from 'axios';
import * as T from '../types';
import type { IncomingMessage } from 'node:http';
import fs from 'node:fs';
import murmur2 from 'murmur2';
import { CurseforgeApi, G, P, Schema } from './api';
import { FileRelationType, FileReleaseType, HashAlgo } from './openapi/types';
import {
  CurseforgeSearchQueryParamsBuilder,
  CurseforgeVersionQueryParamsBuilder,
} from './queryparams';
import { toProjectType } from './mappings';

export class CurseforgeProvider implements T.ApiProvider {
  private api: CurseforgeApi;
  id = 'curseforge' as const;

  constructor(userAgent: string, apiKey?: string) {
    this.api = new CurseforgeApi(userAgent, apiKey);
  }

  async project(id: string) {
    const {
      data: { data: project },
    } = await this.api.get<G<'/v1/mods/{}'>>(`/v1/mods/${id}`);

    return {
      id: project.id.toString(),
      slug: project.slug,

      name: project.name,
      description: project.summary,
      icon: project.logo.url,
      type:
        project.classId !== null ? toProjectType(project.classId) : undefined,

      latestVersions: project.latestFiles.map((file) => file.id.toString()),
    };
  }

  private mapDependencyType(type: FileRelationType) {
    switch (type) {
      case FileRelationType.RequiredDependency:
        return 'required';
      case FileRelationType.OptionalDependency:
        return 'optional';
      case FileRelationType.Include:
      case FileRelationType.EmbeddedLibrary:
        return 'embedded';
      case FileRelationType.Tool:
        return 'tool';
      case FileRelationType.Incompatible:
        return 'incompatible';
    }
  }

  private mapVersion(version: Schema<'File'>): T.Version {
    const mapDependencyType = this.mapDependencyType;

    return {
      id: version.id.toString(),
      projectId: version.modId.toString(),

      name: version.displayName,
      type:
        version.releaseType == FileReleaseType.Beta
          ? ('beta' as const)
          : version.releaseType == FileReleaseType.Alpha
            ? ('alpha' as const)
            : ('release' as const),
      date: version.fileDate,
      downloads: version.downloadCount,
      gameVersions: version.sortableGameVersions
        .filter((version) => version.gameVersion !== '')
        .map((version) => version.gameVersion),
      loaders: version.sortableGameVersions
        .filter((version) => version.gameVersion === '')
        .map((version) => version.gameVersionName.toLowerCase()),

      dependencies: version.dependencies.map(
        (dependency) =>
          ({
            projectId: dependency.modId.toString(),
            versionId: (
              dependency['fileId' as never] as
                | { toString(): string }
                | undefined
            )?.toString(),
            dependencyType: mapDependencyType(dependency.relationType),
          }) as const
      ),

      files: [
        {
          sha1: version.hashes.find((hash) => hash.algo === HashAlgo.Sha1)!
            .value,
          filename: version.fileName,
          url: version.downloadUrl ?? undefined,
        },
      ],
    };
  }

  async version(projectId: string, id: string) {
    const {
      data: { data: version },
    } = await this.api.get<G<'/v1/mods/{}/files/{}'>>(
      `/v1/mods/${projectId}/files/${id}`
    );

    return this.mapVersion(version);
  }

  async versions(
    projectId: string,
    queryParams: string = ''
  ): Promise<T.Version[]> {
    const {
      data: { data: versions },
    } = await this.api.get<G<'/v1/mods/{}/files'>>(
      `/v1/mods/${projectId}/files?${queryParams}`
    );

    return versions.map(this.mapVersion.bind(this));
  }

  async downloadUsingWindow(
    version: T.Version,
    path: string,
    popup: T.DownloadPopup
  ) {
    const { slug } = await this.project(version.projectId);
    const url = `https://www.curseforge.com/minecraft/mc-mods/${slug}/download/${version.id}`;

    return popup(url, path);
  }

  async download(
    version: T.Version,
    path: string,
    options?: T.DownloadOptions
  ) {
    const [file] = version.files;

    if (!file.url) {
      if (!options?.popup) {
        throw new Error(
          'Failed to download file. Version is not available via api and no download popup method was specified'
        );
      }

      return this.downloadUsingWindow(version, path, options.popup);
    }

    const { data } = await axios.get<IncomingMessage>(file.url, {
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
        if (options?.onProgress) {
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
    const hash = murmur2(fs.readFileSync(path), 1, true);
    const hash2 = murmur2(fs.readFileSync(path), 1, false);

    const {
      data: {
        data: { exactMatches: fingerprintMatches },
      },
    } = await this.api.post<P<'/v1/fingerprints'>>(`/v1/fingerprints`, {
      fingerprints: [hash, hash2],
    });

    if (!fingerprintMatches) throw new Error('Failed to get fingerprints');
    const match = fingerprintMatches[0];
    if (!match) throw new Error('Failed to get fingerprints');

    const { file } = match;

    return this.mapVersion(file);
  }

  async search(queryParams: string) {
    const {
      data: {
        data: searchHits,
        pagination: { totalCount: count },
      },
    } = await this.api.get<G<'/v1/mods/search'>>(
      `/v1/mods/search?${queryParams}`
    );

    return {
      hits: await Promise.all(
        searchHits.map(async (hit) => ({
          id: hit.id.toString(),
          provider: 'curseforge' as const,

          url: hit.links.websiteUrl,

          versions: hit.latestFiles,

          name: hit.name,
          description: hit.summary,
          authors: hit.authors.map((author) => author.name),
          icon: hit.logo?.url,
          slug: hit.slug,
        }))
      ),

      count,
    };
  }

  searchQueryParamsBuilder() {
    return new CurseforgeSearchQueryParamsBuilder();
  }

  versionQueryParamsBuilder() {
    return new CurseforgeVersionQueryParamsBuilder();
  }
}

import type {
  AxiosDefaults,
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from 'axios';
import { BodyFor, PathsFor, ResponseFor, UrlFor } from '../utils/types';
import { components as Components, paths as Paths } from './openapi/types';
import { reasonableErrorMessages } from '../utils/axios';

const API_BASE_URL = 'https://api.curseforge.com/';

type CurseforgeGetPaths = PathsFor<Paths, 'get'>;
type CurseforgeGetUrl = keyof CurseforgeGetPaths;
type GetReturnType<T extends CurseforgeGetUrl> = ResponseFor<
  CurseforgeGetPaths,
  T
>;

type CurseforgePostPaths = PathsFor<Paths, 'post'>;
type CurseforgePostUrl = keyof CurseforgePostPaths;
type PostReturnType<T extends CurseforgePostUrl> = ResponseFor<
  CurseforgePostPaths,
  T,
  'post'
>;
export type Schema<T extends keyof Components['schemas']> =
  Components['schemas'][T];

export type G<A extends CurseforgeGetUrl> = A;
export type P<A extends CurseforgePostUrl> = A;

export class CurseforgeApi {
  private _api?: AxiosInstance;
  private apiSettings: CreateAxiosDefaults;

  constructor(userAgent: string, apiKey?: string) {
    this.apiSettings = {
      baseURL: API_BASE_URL,
      headers: {
        'User-Agent': userAgent,
        'x-api-key': apiKey,
      },
    };
  }

  private async api() {
    if (this._api) {
      return this._api;
    }

    this._api = (await import('axios')).create(this.apiSettings);

    reasonableErrorMessages(this._api);

    return this._api;
  }

  async rawGet<T>(url: string, config?: AxiosRequestConfig) {
    return (await this.api()).get<T>(url, config);
  }

  async get<T extends CurseforgeGetUrl>(
    url: UrlFor<CurseforgeGetPaths, T>,
    config?: AxiosRequestConfig
  ) {
    return this.rawGet<GetReturnType<T>>(url, config);
  }

  async rawPost<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return (await this.api()).post<T>(url, data, config);
  }

  async post<T extends CurseforgePostUrl>(
    url: UrlFor<CurseforgePostPaths, T, 'post'>,
    data?: BodyFor<CurseforgePostPaths, T>,
    config?: AxiosRequestConfig
  ) {
    return this.rawPost<PostReturnType<T>>(url, data, config);
  }
}

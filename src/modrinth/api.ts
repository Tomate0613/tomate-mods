import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import PQueue from 'p-queue';
import { components as Components, paths as Paths } from './openapi/types';
import { PathsFor, ResponseFor, UrlFor } from '../utils/types';
import { reasonableErrorMessages } from '../utils/axios';

const API_BASE_URL = 'https://api.modrinth.com/v2';
const CONCURRENCY = 5;
const BUFFER = 5;

type ModrinthPaths = PathsFor<Paths, 'get'>;
type ModrinthGetUrl = keyof ModrinthPaths;
type GetReturnType<T extends ModrinthGetUrl> = ResponseFor<ModrinthPaths, T>;

export type G<A extends ModrinthGetUrl> = A;

export type Schema<T extends keyof Components['schemas']> =
  Components['schemas'][T];

class ModrinthApi {
  private queue: PQueue;
  private remainingRequests: number;
  private resetTime: number;
  private api: AxiosInstance;

  constructor(userAgent: string, apiKey?: string) {
    this.queue = new PQueue({ concurrency: CONCURRENCY });
    this.remainingRequests = 300;
    this.resetTime = 0;

    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'User-Agent': userAgent,
        Authorization: apiKey,
      },
    });

    reasonableErrorMessages(this.api);
  }

  private async updateRateLimits(response: AxiosResponse) {
    this.remainingRequests = Number(response.headers['x-ratelimit-remaining']);
    this.resetTime = Number(response.headers['x-ratelimit-reset']);
  }

  async rawGet<T>(url: string, config?: AxiosRequestConfig) {
    const task = async () => {
      if (this.remainingRequests <= CONCURRENCY + BUFFER) {
        const waitTime = this.resetTime + 10;
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
      }

      const response = await this.api.get<T>(url, config);
      this.updateRateLimits(response);
      return response;
    };

    const result = await this.queue.add(task);
    return result as AxiosResponse<T, any>;
  }

  async get<T extends ModrinthGetUrl>(
    url: UrlFor<ModrinthPaths, T>,
    config?: AxiosRequestConfig
  ) {
    return this.rawGet<GetReturnType<T>>(url, config);
  }
}

export default ModrinthApi;

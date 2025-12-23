type ReplacePlaceholder<
  T extends string,
  Param extends string,
> = T extends `${infer Prefix}{${string}}${infer Suffix}`
  ? `${Prefix}${Param}${ReplacePlaceholder<Suffix, Param>}`
  : T;

type Response<T, Method extends string, Status extends number> = T extends {
  [M in Method]: {
    responses: {
      [S in Status]: {
        content: {
          'application/json': infer R;
        };
      };
    };
  };
}
  ? R
  : never;

type QueryParameters<T, Method extends string> = T extends {
  [M in Method]: { parameters: { query?: infer P } };
}
  ? [P] extends [never | undefined]
    ? never
    : P
  : never;

export type PathsFor<Paths, Method extends keyof Paths[keyof Paths]> = {
  [P in keyof Paths as Paths[P][Method] extends never | undefined
    ? never
    : ReplacePlaceholder<P & string, '{}'>]: Paths[P];
};

export type RequestBody<T, Method extends string> = T extends {
  [M in Method]: {
    requestBody: { content: { 'application/json': infer P } };
  };
}
  ? P
  : never;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type Params<T> = [T] extends [never]
  ? ''
  : RequiredKeys<T> extends never
    ? '' | `?${string}`
    : `?${string}`;

export type ResponseFor<
  Paths extends Record<string, any>,
  T extends keyof Paths,
  Method extends string = 'get',
  Status extends number = 200,
> = Response<Paths[T], Method, Status>;

export type UrlFor<
  Paths,
  T extends keyof Paths,
  Method extends string = 'get',
> = T extends string
  ? `${ReplacePlaceholder<T, string>}${Params<QueryParameters<Paths[T], Method>>}`
  : never;

export type BodyFor<
  Paths,
  T extends keyof Paths,
  Method extends string = 'post',
> = RequestBody<Paths[T], Method>;


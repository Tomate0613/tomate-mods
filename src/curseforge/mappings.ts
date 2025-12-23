import { ProjectType } from '../types';

export * from './openapi/types';

export const GAME_ID_MINECRAFT = '432';

const classIdMapping: Record<Exclude<ProjectType, 'other'>, number> = {
  mod: 6,
  resourcepack: 12,
  shaderpack: 6552,
  modpack: 4471,
  plugin: 5,
  world: 5,
  datapack: 6945,
};

type Mapping = typeof classIdMapping;
type Mapped = keyof Mapping;

const reverseClassIdMapping = Object.fromEntries(
  Object.entries(classIdMapping).map(([k, v]) => [v, k])
) as Partial<Record<number, ProjectType>>;

export function toClassId<T extends ProjectType>(
  projectType: T
): T extends Mapped ? Mapping[T] : null {
  return projectType in classIdMapping
    ? classIdMapping[projectType as never]
    : (null as never);
}

export function toProjectType(classId: number) {
  return classId in reverseClassIdMapping
    ? reverseClassIdMapping[classId]
    : undefined;
}

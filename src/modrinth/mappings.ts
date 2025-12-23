import { ProjectType } from '../types';
import { Schema } from './api';

type MrProjectType = Schema<'Project'>['project_type'];

const projectTypeMapping: Partial<
  Record<Exclude<ProjectType, 'other'>, MrProjectType>
> = {
  mod: 'mod',
  resourcepack: 'resourcepack',
  shaderpack: 'shader',
  modpack: 'modpack',
};

type Mapping = typeof projectTypeMapping;
type Mapped = keyof Mapping;

const reverseProjectTypeMapping = Object.fromEntries(
  Object.entries(projectTypeMapping).map(([k, v]) => [v, k])
) as Record<MrProjectType, ProjectType>;

export function toModrinthProjectType<T extends ProjectType>(
  projectType: T
): T extends Mapped ? Mapping[T] : null {
  return projectType in projectTypeMapping
    ? projectTypeMapping[projectType as never]
    : (null as never);
}

export function toProjectType(projectType: MrProjectType) {
  return reverseProjectTypeMapping[projectType];
}

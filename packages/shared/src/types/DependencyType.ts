type BaseDependencyType = 'dependency' | 'devDependency' | 'optionalDependency' | 'peerDependency';

export type DependencyType = BaseDependencyType | `transitive${Capitalize<BaseDependencyType>}`;

export type AboutLibrariesLibraryJsonPayload = {
  artifactVersion: string;
  description: string;
  developers: { name: string; organisationUrl: string }[];
  licenses: string[];
  name: string;
  tag: string;
  uniqueId: string;
  website: string | undefined;
};

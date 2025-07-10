import { normalizeRepositoryUrl } from '../repositoryUtils';

describe('normalizeRepositoryUrl', () => {
  it('should convert "git+ssh" protocol to https URL and remove ".git"', () => {
    const url = 'git+ssh://git@github.com:callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should convert "git+https" protocol to https URL and remove ".git"', () => {
    const url = 'git+https://github.com/callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should convert "git" protocol URL to https URL and remove ".git"', () => {
    const url = 'git://github.com/callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should convert "git@github.com:" URL to https URL and remove ".git"', () => {
    const url = 'git@github.com:callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should convert "github:" shorthand to https URL and remove ".git"', () => {
    const url = 'github:callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should remove ".git" from https URL', () => {
    const url = 'https://github.com/callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should not modify a valid https URL', () => {
    const url = 'https://github.com/callstackincubator/react-native-legal';

    expect(normalizeRepositoryUrl(url)).toBe('https://github.com/callstackincubator/react-native-legal');
  });

  it('should handle valid https URLs with ".git" suffixes', () => {
    const url = 'https://gitlab.com/callstackincubator/react-native-legal.git';

    expect(normalizeRepositoryUrl(url)).toBe('https://gitlab.com/callstackincubator/react-native-legal');
  });
});

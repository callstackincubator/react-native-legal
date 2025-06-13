export function normalizeRepositoryUrl(url: string) {
  return url
    .replace('git+ssh://git@', 'git://')
    .replace('.git', '')
    .replace('git+https://github.com', 'https://github.com')
    .replace('.git', '')
    .replace('git://github.com', 'https://github.com')
    .replace('.git', '')
    .replace('git@github.com:', 'https://github.com/')
    .replace('.git', '')
    .replace('github:', 'https://github.com/')
    .replace('.git', '');
}

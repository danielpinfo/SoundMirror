export const NavigationService = {
  go(path: string) {
    if (typeof window !== 'undefined') window.location.assign(path);
  }
};
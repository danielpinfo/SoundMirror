export const SearchParamService = {
  get(name: string) {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },
  set(name: string, value: string | null) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (value == null) url.searchParams.delete(name); else url.searchParams.set(name, value);
    window.history.replaceState({}, '', url.toString());
  }
};
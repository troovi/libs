export const matchPattern = (name: string, pattern: string) => {
  return name.toLowerCase().indexOf(pattern.trim().toLowerCase()) >= 0
}

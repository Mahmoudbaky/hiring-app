export function useOpenCv() {
  const openCv = (storedUrl: string) => {
    window.open(storedUrl, "_blank", "noopener,noreferrer");
  };

  return { openCv };
}

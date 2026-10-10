export const extractBinIdFromQR = (qrText: string) => {
  try {
    const url = new URL(qrText);
    const parts = url.pathname.split("/");
    return parts[parts.length - 1];
  } catch {
    return null;
  }
};
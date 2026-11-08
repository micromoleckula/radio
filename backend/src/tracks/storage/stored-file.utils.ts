import { stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

export async function isStoredFileAvailable(
  directory: string,
  filename: string | null,
): Promise<boolean> {
  if (!filename || basename(filename) !== filename) {
    return false;
  }

  try {
    return (await stat(resolve(directory, filename))).isFile();
  } catch (error) {
    if (isMissingFileError(error)) {
      return false;
    }

    throw error;
  }
}

export function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

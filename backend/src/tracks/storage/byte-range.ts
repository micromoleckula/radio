export interface ByteRange {
  start: number;
  end: number;
}

export function parseByteRange(
  value: string,
  fileSize: number,
): ByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);

  if (!match || (!match[1] && !match[2]) || fileSize === 0) {
    return null;
  }

  const startValue = match[1] ? Number(match[1]) : undefined;
  const endValue = match[2] ? Number(match[2]) : undefined;

  if (startValue === undefined) {
    if (endValue === undefined || endValue === 0) {
      return null;
    }

    return {
      start: Math.max(fileSize - endValue, 0),
      end: fileSize - 1,
    };
  }

  const end = endValue === undefined ? fileSize - 1 : endValue;

  if (
    !Number.isSafeInteger(startValue) ||
    !Number.isSafeInteger(end) ||
    startValue >= fileSize ||
    end < startValue
  ) {
    return null;
  }

  return { start: startValue, end: Math.min(end, fileSize - 1) };
}

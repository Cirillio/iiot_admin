/**
 * Largest-Triangle-Three-Buckets — даунсэмпл временного ряда с сохранением визуальной
 * формы (пики/провалы не теряются, в отличие от простого прореживания).
 * points: [unix_ms, value], отсортированы по времени. threshold — целевое число точек.
 */
export function downsampleLTTB(
  points: [number, number][],
  threshold: number,
): [number, number][] {
  const n = points.length;
  if (threshold >= n || threshold <= 2) return points;

  const sampled: [number, number][] = [];
  const bucketSize = (n - 2) / (threshold - 2);

  let a = 0; // индекс последней выбранной точки
  sampled.push(points[0]!);

  for (let i = 0; i < threshold - 2; i++) {
    // Среднее следующего бакета (для построения треугольника)
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
    let avgX = 0;
    let avgY = 0;
    const avgCount = avgEnd - avgStart;
    for (let j = avgStart; j < avgEnd; j++) {
      avgX += points[j]![0];
      avgY += points[j]![1];
    }
    avgX /= avgCount;
    avgY /= avgCount;

    // Точки текущего бакета
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    const pointA = points[a]!;
    let maxArea = -1;
    let nextA = rangeStart;
    let nextPoint = points[rangeStart]!;

    for (let j = rangeStart; j < rangeEnd; j++) {
      const p = points[j]!;
      const area =
        Math.abs(
          (pointA[0] - avgX) * (p[1] - pointA[1]) -
            (pointA[0] - p[0]) * (avgY - pointA[1]),
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        nextPoint = p;
        nextA = j;
      }
    }

    sampled.push(nextPoint);
    a = nextA;
  }

  sampled.push(points[n - 1]!);
  return sampled;
}

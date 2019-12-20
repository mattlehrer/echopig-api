export function parseDurationString(str: string): number {
  let duration = 0;
  if (str.indexOf('H') !== -1) {
    duration += Number(str.split('H')[0]) * 60 * 60;
    str = str.split('H')[1];
  }
  if (str.indexOf('M') !== -1) {
    duration += Number(str.split('M')[0]) * 60;
    str = str.split('M')[1];
  }
  if (str.indexOf('S') !== -1) {
    duration += Number(str.split('S')[0]);
  }
  return duration;
}

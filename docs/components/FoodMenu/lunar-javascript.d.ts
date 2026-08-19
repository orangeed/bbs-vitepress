declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar
    static fromYmd(year: number, month: number, day: number): Lunar
    getMonth(): number
    getDay(): number
    getYear(): number
  }
  export class Solar {
    static fromDate(date: Date): Solar
    static fromYmd(year: number, month: number, day: number): Solar
    getLunar(): Lunar
  }
}

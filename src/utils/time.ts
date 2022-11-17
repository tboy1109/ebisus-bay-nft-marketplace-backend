import dayjs from "dayjs"

export default class Time {

    static format(millis: number): string {

        return millis === 0 ? "" : dayjs.unix(millis).format()

    }

}

// 格式化时间
// 输入秒数 输出 00:00:00
export const formatTime = (time: number) => {
    const t = Number(time) / 1000
    const h = Math.floor(t / 3600).toString().padStart(2, '0')
    const m = (Math.floor(t / 60) % 60).toString().padStart(2, '0')
    const s = (Math.floor(t % 60)).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
}

// 输入豪秒数 输出 0'00"
export const formatTime2 = (time: number) => {
    const t = Number(time) / 1000
    const m = Math.floor(t / 60).toString()
    const s = (Math.floor(t % 60)).toString().padStart(2, '0')
    return `${m}'${s}"`
}

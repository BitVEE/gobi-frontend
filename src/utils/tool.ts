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

// 输入时间戳 输出 2023-01-01
export const formatDate = (str: any) => {
    let date:any = new Date(str);
    let year:any = date.getFullYear();
    let month:any = date.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    let day = date.getDate();
    day = day < 10 ? ('0' + day) : day;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let m = date.getMinutes();
    m = m < 10 ? ('0' + m) : m;
    let s = date.getSeconds();
    s = s < 10 ? ('0' + s) : s;
    // return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
    return year + '-' + month + '-' + day ;
  }
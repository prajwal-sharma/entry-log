let currentTime = new Date();

let currentOffset = currentTime.getTimezoneOffset();

let ISTOffset = 330;   // IST offset UTC +5:30

let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

// ISTTime now represents the time in IST coordinates

let hoursIST = ISTTime.getHours()
let minutesIST = ISTTime.getMinutes()
let inp = document.getElementById('#atime')
inp.value=ISTTime
console.log(hoursIST + ":" + minutesIST + " ")
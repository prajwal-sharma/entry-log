let currentTime = new Date();

let currentOffset = currentTime.getTimezoneOffset();

let ISTOffset = 330;   // IST offset UTC +5:30

let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

// ISTTime now represents the time in IST coordinates

// let hoursIST = ISTTime.getHours()
// let minutesIST = ISTTime.getMinutes()
// let inp = document.getElementById('#atime')
// // inp.value=ISTTime
// console.log(hoursIST + ":" + minutesIST + " ")
$('#close-button-done').click(function () {
    $('#id-done').fadeOut("slow");
})

$('#close-button-cout').click(function () {
    $('#id-cout').fadeOut("slow");
})

function resize() {
    if ($(window).width() < 975) {
        $('i').addClass('fa-3x');
        $('i').addClass('add-spacing')
    }
    else {
        $('i').removeClass('fa-3x');
        $('i').removeClass('add-spacing')
    }
}

$(document).ready( function() {
    $(window).resize(resize);
    resize();
});
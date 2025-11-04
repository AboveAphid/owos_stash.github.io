function popup(message, disappear_delay_ms=5000) {
    var info_popup = document.getElementById("info-popup")

    if (info_popup === null) {
        alert(message)
        return
    }
    info_popup.style.opacity = 1
    info_popup.textContent = message

    setTimeout(function () {
        info_popup.style.opacity = 0
        // info_popup.textContent = "Byebye :3"
    }, disappear_delay_ms)
}

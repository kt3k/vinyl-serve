Array.prototype.forEach.call(document.getElementsByClassName('vinyl'), function (elem) {
    elem.addEventListener('click', function () {
        elem.setAttribute('data-toggle', elem.getAttribute('data-toggle') ^ 1)
    })
})

var vToggle = document.getElementById('vinyl-toggle')

vToggle.addEventListener('click', function (elem) {
    var toggle = vToggle.getAttribute('data-toggle') ^ 1
    vToggle.setAttribute('data-toggle', toggle)
    Array.prototype.forEach.call(document.getElementsByClassName('vinyl'), function (item) {
        item.setAttribute('data-toggle', toggle)
    })
})

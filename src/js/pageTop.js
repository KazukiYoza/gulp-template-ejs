//ページトップ
$(window).scroll(function () {
    if ($(this).scrollTop() > 200) {
        $('.pft__pageTop').fadeIn();
    } else {
        $('.pft__pageTop').fadeOut();
    }
});
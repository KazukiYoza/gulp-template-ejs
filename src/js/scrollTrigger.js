// スクロールして可視範囲に入ったらアニメーション発火
$(window).scroll(function (){
    $('.js-fadeInUp').each(function(){
        var position = $(this).offset().top;
        var scroll = $(window).scrollTop();
        var windowHeight = $(window).height();
        if (scroll > position - windowHeight + 200){
            $(this).addClass('fadeInUp animated');
        }
    });
});
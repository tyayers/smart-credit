var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var creditLength = 24;
var creditResult = {};
var amount = 10000;
var lastPicture = "";
var creditLength = 48;
var monthlyAmount = 208.33;
var insuranceRate = 0;
var totalRate = 208.33;
var insuranceOffers = {};

function setLogo() {
  $('#logo-dialog').modal('toggle');
}

function saveConfig() {
    var logoSrc = $('#logo-file-upload-image').attr('src');
    var vis = $("#logo-file-upload-content").css('display');
    if (vis == "block" && logoSrc != null && logoSrc != "#")
        localStorage.setItem('sc-logo', logoSrc);
    else
        localStorage.removeItem('sc-logo');

    var nameText = $('#company-name').val();
    if (nameText != "")
        localStorage.setItem('sc-name', nameText);
    else
        localStorage.removeItem('sc-name');

    var addressText = $('#company-address').val();
    if (addressText != "")
        localStorage.setItem('sc-address', addressText);
    else
        localStorage.removeItem('sc-address');

    var emailText = $('#company-email').val();
    if (emailText != "")
        localStorage.setItem('sc-email', emailText);
    else
        localStorage.removeItem('sc-email');

    var phoneText = $('#company-phone').val();
    if (phoneText != "")
        localStorage.setItem('sc-phone', phoneText);
    else
        localStorage.removeItem('sc-phone');

    location.reload();
}

function loadConfig() {
    var logoSrc = localStorage.getItem('sc-logo');
    if (logoSrc != null && logoSrc != "#") {
        $('#sc-logo').attr('src', logoSrc);
        $('#logo-file-upload-image').attr('src', logoSrc);
        $("#logo-file-upload-content").show();
    }
    else
        $('#sc-logo').attr('src', "img/core-img/apibank-logo.png");

    var name = localStorage.getItem('sc-name');
    if (name != null && name != "") {
        $("#company-name").val(name);
        document.title = name;
        $("#exampleModalLabel").text(name + " Instant Credit");
    }

    var address = localStorage.getItem('sc-address');
    if (address != null && address != "") {
        $("#address-text").text(address);
        $("#company-address").val(address);

    }

    var email = localStorage.getItem('sc-email');
    if (email != null && email != "") {
        $("#email-text").text(email);
        $("#company-email").val(email);
    }

    var phone = localStorage.getItem('sc-phone');
    if (phone != null && phone != "") {
        $("#phone-text").text(phone);
         $("#company-phone").val(phone);
    }        
}

// Credit / image logic
function callCreditService(picture) {
  lastPicture = picture;
  axios.post('https://emea-poc13-prod.apigee.net/smart-credit/credit/calculate-rate?apikey=6jJG8Vl5WnoWKZkWfYxkzczJxfGEQ1Wr', {
      months: creditLength,
      images: {
        requests: [
          {
            image: {
              content: picture.split(',')[1]
            },
            features: [{ type: "LABEL_DETECTION" }]
            }
          ]
      }
    })
    .then(function(response) {
      console.log(response);
      removeUpload();
      creditResult = response.data;
      $("#object-name").empty();

      var newType = response.data.objectType.replace(/^\w/, c => c.toUpperCase());
      if (newType == "Unknown") {
        var keywords = response.data.objectKeywords.split(",");
      	newType = keywords[0].replace(/^\w/, c => c.toUpperCase());
      }

      $("#object-name").append(newType);
      amount = response.data.objectValue;
      $("#credit-amount").val(amount);

      $("#insurance-list").empty();
      for (i = 0; i < creditResult.addOns.length; i++) {
        var insuranceObject = creditResult.addOns[i];
        $("#insurance-list").append(`
            <a href="#" onclick="setInsuranceRate(` + insuranceObject.rate + `);" class="list-group-item list-group-item-action flex-column align-items-start" >
                <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">` + insuranceObject.providerName + `</h5>
                <small>+ € ` + insuranceObject.rate + ` per month</small>
                </div>
                <p class="mb-1">` + insuranceObject.website + `</p>
            </a>`);
      }

      monthlyAmount = parseFloat(creditResult.rate);
      totalRate = (monthlyAmount + insuranceRate).toFixed(2);

      $(".credit-monthly-amount").text(monthlyAmount + " €");
      $("#insurance-monthly-amount").text(insuranceRate + " €");
      $("#total-monthly-amount").text(totalRate + " €");

      $(".next").click();
    }.bind(this))
    .catch(function(error) {
      console.log(error);
    });

}

// Real credit logic

function setInsuranceRate(rate) {
  insuranceRate = rate;
  totalRate = (monthlyAmount + insuranceRate).toFixed(2);

  $("#insurance-monthly-amount").text(insuranceRate + " €");
  $("#total-monthly-amount").text(totalRate + " €");
}

function submitCredit() {

  $('#credit-enroll-dialog').modal('toggle');

  toastr.optionsOverride = 'positionclass = "toast-bottom-right"';
  toastr.options.positionClass = 'toast-bottom-right';
  toastr.onclick = function() {
    alert("hi");
  }
  //show when the button is clicked
  toastr.success('Check your credit status in our mobile app!', 'Application successful', { positionclass: "toast-bottom-right", onclick: function() { window.open("app/index.html", '_blank'); } });
}

function readLogoUrl(input) {
  console.log("hi");
  if (input.files && input.files[0]) {

    var reader = new FileReader();

    reader.onload = function(e) {
      $('#logo-image-upload-wrap').hide();

      $('#logo-file-upload-image').attr('src', e.target.result);
      $('#logo-file-upload-content').show();

      $('#logo-image-title').html(input.files[0].name);

      //callCreditService(e.target.result);
    };

    reader.readAsDataURL(input.files[0]);

  } else {
    removeUpload();
  }
}

function readURL(input) {
  if (input.files && input.files[0]) {

    var reader = new FileReader();

    reader.onload = function(e) {
      $('#imageUploadWrap').hide();

      $('#fileUploadImage').attr('src', e.target.result);
      $('#fileUploadContent').show();

      $('#imageTitle').html(input.files[0].name);

      callCreditService(e.target.result);
    };

    reader.readAsDataURL(input.files[0]);

  } else {
    removeUpload();
  }
}

function removeUpload() {
  $('#fileUploadInput').replaceWith($('.file-upload-input').clone());
  $('#fileUploadContent').hide();
  $('#imageUploadWrap').show();
}

function removeLogoUpload() {
  $('#logo-file-upload-input').replaceWith($('.file-upload-input').clone());
  $('#logo-file-upload-content').hide();
  $('#logo-image-upload-wrap').show();
}

$('.image-upload-wrap').bind('dragover', function() {
  $('.image-upload-wrap').addClass('image-dropping');
});

$('.image-upload-wrap').bind('dragleave', function() {
  $('.image-upload-wrap').removeClass('image-dropping');
});

// Multi step form logic

//jQuery time
function setCreditLength(newLength) {
  creditLength = newLength;
  $("#credit-length").text(creditLength + " months");
  callCreditService(lastPicture);
}

$(".next").click(function() {
  if (animating) return false;
  animating = true;

  current_fs = $(this).parent();
  next_fs = $(this).parent().next();

  //activate next step on progressbar using the index of next_fs
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

  //show the next fieldset
  next_fs.show();
  //hide the current fieldset with style
  current_fs.animate({ opacity: 0 }, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale current_fs down to 80%
      scale = 1 - (1 - now) * 0.2;
      //2. bring next_fs from the right(50%)
      left = (now * 50) + "%";
      //3. increase opacity of next_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({
        'transform': 'scale(' + scale + ')',
        'position': 'absolute'
      });
      next_fs.css({ 'left': left, 'opacity': opacity });
    },
    duration: 800,
    complete: function() {
      current_fs.hide();
      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

$(".previous").click(function() {
  if (animating) return false;
  animating = true;

  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();

  //de-activate current step on progressbar
  $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

  //show the previous fieldset
  previous_fs.show();
  //hide the current fieldset with style
  current_fs.animate({ opacity: 0 }, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale previous_fs from 80% to 100%
      scale = 0.8 + (1 - now) * 0.2;
      //2. take current_fs to the right(50%) - from 0%
      left = ((1 - now) * 50) + "%";
      //3. increase opacity of previous_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({ 'left': left });
      previous_fs.css({ 'transform': 'scale(' + scale + ')', 'opacity': opacity });
    },
    duration: 800,
    complete: function() {
      current_fs.hide();
      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

$(".submit").click(function() {
  return false;
})

function openApp() {
  //alert("hi!");
}

(function($) {
  'use strict';

  loadConfig();

  var browserWindow = $(window);

  // :: 1.0 Preloader Active Code
  browserWindow.on('load', function() {
    $('.preloader').fadeOut('slow', function() {
      $(this).remove();
    });
  });

  // :: 2.0 Nav Active Code
  if ($.fn.classyNav) {
    $('#creditNav').classyNav();
  }

  // :: 3.0 Sliders Active Code
  if ($.fn.owlCarousel) {
    var welcomeSlide = $('.hero-slideshow');

    welcomeSlide.owlCarousel({
      items: 1,
      loop: true,
      nav: true,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
      dots: true,
      autoplay: true,
      autoplayTimeout: 10000,
      smartSpeed: 500
    });

    welcomeSlide.on('translate.owl.carousel', function() {
      var slideLayer = $("[data-animation]");
      slideLayer.each(function() {
        var anim_name = $(this).data('animation');
        $(this).removeClass('animated ' + anim_name).css('opacity', '0');
      });
    });

    welcomeSlide.on('translated.owl.carousel', function() {
      var slideLayer = welcomeSlide.find('.owl-item.active').find("[data-animation]");
      slideLayer.each(function() {
        var anim_name = $(this).data('animation');
        $(this).addClass('animated ' + anim_name).css('opacity', '1');
      });
    });

    $("[data-delay]").each(function() {
      var anim_del = $(this).data('delay');
      $(this).css('animation-delay', anim_del);
    });

    $("[data-duration]").each(function() {
      var anim_dur = $(this).data('duration');
      $(this).css('animation-duration', anim_dur);
    });
  }

  // :: 4.0 ScrollUp Active Code
  if ($.fn.scrollUp) {
    browserWindow.scrollUp({
      scrollSpeed: 1500,
      scrollText: '<i class="fa fa-angle-up"></i> Top'
    });
  }

  // :: 5.0 CounterUp Active Code
  if ($.fn.counterUp) {
    $('.counter').counterUp({
      delay: 10,
      time: 2000
    });
  }

  // :: 6.0 Progress Bar Active Code
  if ($.fn.circleProgress) {
    $('#circle').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#fff',
      thickness: '3',
      reverse: true
    });
    $('#circle2').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#fff',
      thickness: '3',
      reverse: true
    });
    $('#circle3').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#fff',
      thickness: '3',
      reverse: true
    });
    $('#circle4').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#ffbb38',
      thickness: '3',
      reverse: true
    });
    $('#circle5').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#ffbb38',
      thickness: '3',
      reverse: true
    });
    $('#circle6').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#ffbb38',
      thickness: '3',
      reverse: true
    });
    $('#circle7').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#ffbb38',
      thickness: '3',
      reverse: true
    });
    $('#circle8').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#ffbb38',
      thickness: '3',
      reverse: true
    });
    $('#circle9').circleProgress({
      size: 90,
      emptyFill: "rgba(0, 0, 0, .0)",
      fill: '#ffbb38',
      thickness: '3',
      reverse: true
    });
  }

  // :: 7.0 Tooltip Active Code
  if ($.fn.tooltip) {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // :: 8.0 Prevent Default a Click
  $('a[href="#"]').on('click', function($) {
    $.preventDefault();
  });

  // :: 9.0 Jarallax Active Code
  if ($.fn.jarallax) {
    $('.jarallax').jarallax({
      speed: 0.2
    });
  }

  // :: 10.0 Sticky Active Code
  if ($.fn.sticky) {
    $("#sticker").sticky({
      topSpacing: 0
    });
  }

  // :: 11.0 Wow Active Code
  if (browserWindow.width() > 767) {
    new WOW().init();
  }

})(jQuery);
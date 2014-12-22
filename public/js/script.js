var canvas = document.getElementById("textCanvas");
var context = canvas.getContext('2d');

var emmeasure = context.measureText("M").width;
var spacemeasure = context.measureText(" ").width;

var checked = true;
var credit_text = "Tweeted using Storming.ME";
var TCO_LENGTH = 23;
var IMAGE_LINK_LENGTH = 23;
var font = "Lato";


$('.login-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Login');
});

$('.example-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Example');
});

$('.why-btn').click(function() {
  ga('send', 'event', 'Homepage', 'click', 'Why Medium');
});

$('#textCanvas').attr('width', $('.panel-body').width());

$('.textBox').keyup(function() {
  draw();
});

$(window).resize(function() {
  draw();
});


function draw() {
  var lines = fragmentText($('.textBox').text(), canvas.width * 0.8),
      font_size = 20;
  
  $('#textCanvas').attr('width', $('.panel-body').width());
  $('#textCanvas').attr('height', lines.length * (font_size + 5) + 100);
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fill();
  context.font = font_size + "px " + font;
  context.textBaseline = 'top';
  context.fillStyle = "#333333";
  
  lines.forEach(function(line, i) {
    context.fillText(line, canvas.width * 0.1, (i + 1) * (font_size + 5));
  });
  if (checked) {
    context.fillText(credit_text,
                     canvas.width - (emmeasure * credit_text.length) - 80,
                     canvas.height - (font_size + 10));
  }
  document.getElementById('image').src = context.canvas.toDataURL();
  context.restore();
}


function fragmentText(text, maxWidth) {
  if (maxWidth < emmeasure) {
    throw "Can't fragment less than one character.";
  }

  if (context.measureText(text).width < maxWidth) {
    return [text];
  }

  function getEdgeWords(word, maxWidth) {
    var wlen = word.length;
    if (wlen === 0) return [];
    if (wlen === 1) return [word];

    var awords = [], cword = "", cmeasure = 0, letters = [];

    for (var l = 0; l < wlen; l++) {
      letters.push({
        "letter": word[l],
        "measure": context.measureText(word[l]).width
      });
    }

    for (var ml in letters) {
      var metaletter = letters[ml];

      if (cmeasure + metaletter.measure > maxWidth) {
        awords.push({
          "word": cword,
          "len": cword.length,
          "measure": cmeasure
        });
        cword = "";
        cmeasure = 0;
      }

      cword += metaletter.letter;
      cmeasure += metaletter.measure;
    }
    awords.push({
      "word": cword,
      "len": cword.length,
      "measure": cmeasure
    });
    return awords;
  }

  var words = text.split(' '),
      metawords = [],
      lines = [];

  for (var w in words) {
    var word = words[w];
    var measure = context.measureText(word).width;

    if (measure > maxWidth) {
      var edgewords = getEdgeWords(word, maxWidth);

      for (var ew in edgewords) {
        metawords.push(edgewords[ew]);
      }
    } else {
      metawords.push({
        "word": word,
        "len": word.length,
        "measure": measure
      });
    }
  }

  var cline = "";
  var cmeasure = 0;
  for (var mw in metawords) {
    var metaword = metawords[mw];

    if ((cmeasure + metaword.measure > maxWidth) &&
         cmeasure > 0 && metaword.len > 1) {
      lines.push(cline);
      cline = "";
      cmeasure = 0;
    }

    cline += metaword.word;
    cmeasure += metaword.measure;

    if (cmeasure + spacemeasure < maxWidth) {
      cline += " ";
      cmeasure += spacemeasure;
    } else {
      lines.push(cline);
      cline = "";
      cmeasure = 0;
    }
  }
  if (cmeasure > 0) {
    lines.push(cline);
  }

  return lines;
}


$('.tweet-button').click(function() {
  $('.tweet-button').text('Posting your tweetstorm...');
  $('.tweetresult').css('display', 'none');
  ga('send', 'event', 'Dashboard', 'Click', 'Tweet', $('.textBox').text().length);
  $.post('/tweet', { image: $('#image').attr('src'), message: $('#textArea').val() }, function(data) {
    console.log(data);
    $('.tweetresult').css('display', 'block');
    $('.tweetresult').find('.embed').html(data);
    $('.tweet-button').text('Post Tweetstorm as Picture');
  });
});


$('#credit').click(function() {
  var $this = $(this);
  checked = $this.is(':checked');
  if (checked) {
    $('.textBox').after('<div class="credit-preview">' + credit_text + '</div>');
  } else {
    $('.panel-body').find('.credit-preview').remove();
  }
  draw();
});

$('#font').click(function() {
  var $this = $(this);
  checked = $this.is(':checked');
  if (checked) {
    font = 'Merriweather';
  } else {
    font = 'Lato';
  }
  $('.textBox').css('font-family', font);
  $('.credit-preview').css('font-family', font);
  draw();
});


$('#textArea').keyup(function() {
  var text = $(this).val();
  var splits = text.split(' ');
  geturl = new RegExp("(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))", "g");
  var length = 0;

  for (var i = 0; i < splits.length; i++) {
    if (splits[i].match(geturl) && splits[i].length > TCO_LENGTH) {
      // it's a url and under max length
      length += TCO_LENGTH;
    } else {
      length += splits[i].length;
    }
  }
  $('.text-length').text(IMAGE_LINK_LENGTH + length + '/140');
});

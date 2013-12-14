## 模板引擎实现

实现原理：将传入模板中的字符进行分类，组成一个新的字符串。 再通过new Function形式，将刚才拼成的新字符串变成js代码 生成一个匿名函数，最后调用这个匿名函数并传入序列化参数。

/**underscope实现***
//不匹配任何东西
var noMatch = /(.)^/;
  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  //字符转义，注意：这里的value其实 少些了一个"\"  ,因为 下面replace中统一 加 “\”
  var escapes = {
    "'":      "'",   //  单引号转义
    '\\':     '\\',  //双斜杠转义
    '\r':     'r',   //回车
    '\n':     'n',   //换行
    '\t':     't',   //制表符
    '\u2028': 'u2028', 
    '\u2029': 'u2029'
  };
//如果字符中有以下字符，则需要转义
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    //正则合体变成一个
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    //字符串拼接
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) { 
      //如：'hi my name is:<% name%> ';  先截取 text中 第一次匹配到字符之前的内容，即： 'hi,my name is:' ,且转义有需要的字符
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });
      //如果有需要escape的字符，用_.escape进行转义。注意：此处的__t  是一个临时用来存放escape 的变量
      //如果__t == null，则返回空，否则 转义 __t
      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      //同上，只是少了escape
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      //注意，这里跟其他模板引擎不同。直接将 模板中得js，如： <% if(name){%> 这种直接把if(name){,  添加到source
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      //修改索引值
      index = offset + match.length;
      return match;
    });
    //闭合字符串，结束
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    //with制定，模板当前的作用域
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    //上面source拼接的适合用到了变量，__t,__p ，需要提前定义一下。另外这个print我就不知道干啥用了？
    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";
    //new Function形式生成一个匿名函数，传入参数 obj，_(underscore)，  source是需要执行的js代码
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }
    //如果传了data，则输出经过填充的字符串，否则只输出模板
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

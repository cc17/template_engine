var TemplateEngine = function(html, options) {


    var re = /<%([^%>]+)?%>/g, 
    	reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, 
    	code = 'var r=[];\n', 
        //template maybe defined as: <%  name  %>
    	trimReg = /(^\s+)|(\s+$)/g,
    	cursor = 0;
    //支持传入id，通过id获取模板
    var elem = document.getElementById(html);
    var hasValue = 
    html = elem ? (/input|textarea/.test(elem.tagName.toLowerCase()) ? elem.value : elem.innerHTML) : html;    

    var add = function(line, js) {
        //todo: 循环中还是需要this. ?  
        //add scope this,so template define does't need add this . i.e: <% name%> but not <% this.name%>
        js? (code += line.match(reExp) ? + line + '\n' : 'r.push(this.' + line.replace(trimReg,'') + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}
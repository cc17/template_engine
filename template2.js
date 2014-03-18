/**
 * @author by 素人渔夫
 * /

function template(tpl,data){
		var reg = /<%([^%>]+)%>/g,
			regExp = /(^( )?(if|else|switch|case|break|{|}))(.*)?/g,
			result,
			cursor = 0,
			temp = 'with(data){var arr = [];\n';

		var add = function(code,js){
			js ? temp += code.match(regExp) ? code : 'arr.push('+ code +');\n'
				: temp += 'arr.push("'+ code.replace(/"/g,'\\"') +'");\n';
		};
		while(result = reg.exec(tpl)){
			add(tpl.slice(cursor,result.index));
			add(result[1],true);
			cursor = result.index + result[0].length;
		}
		temp += 'return arr.join("");\n';
		temp += '}';
		//console.log(temp);
		var fn = new Function('data',temp);
		fn(data);
		var returnStr = fn(data);
		return returnStr;
	};	
	var tpl = 'my name is '
		+ '<%if(name){%>'
			+'<%name%>'
		+ '<%}%>'
		+ ',age is <%age%>.当哩个当 <%post.message%>';

	var result = template(tpl,{
		name:'dxm',
		age:27,
		post:{
			message:'nha'
		}
	});
	console.log(result);

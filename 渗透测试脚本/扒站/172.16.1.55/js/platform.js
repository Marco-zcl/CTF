$.extend(true, render, {
	ajax : {
		dataKey : "data",
		check : function(json) {
			if (json.msg) {
				alert(json.msg);
			} else {
				alert("参数错误!");
			}
			return json.code == 0;
		}
	},
	table : {
		total : "total",
		ajaxData : function(start, length, search, order, dir) {
			return {
				url : "",
				type : "get",
				data : {
					current : start,
					size : length,
					keywords : search,
					orderBy : order,
					asc : dir == "asc"
				},
				async : false,
				error : function() {
				}
			}
		}
	},
});
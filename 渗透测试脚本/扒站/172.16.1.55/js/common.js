var $doc = $(document);
var $win = $(window);

if (!window.PATH) {
	window.PATH = "";
}

Date.prototype.format = function(format) {
	if (isNaN(this.getMonth())) {
		return "";
	}
	if (!format) {
		format = "yyyy-MM-dd hh:mm:ss";
	}
	var o = {
		/* month */
		"M+" : this.getMonth() + 1,
		/* day */
		"d+" : this.getDate(),
		/* hour */
		"h+" : this.getHours(),
		/* minute */
		"m+" : this.getMinutes(),
		/* second */
		"s+" : this.getSeconds(),
		/* quarter */
		"q+" : Math.floor((this.getMonth() + 3) / 3),
		/* millisecond */
		"S" : this.getMilliseconds()
	};
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	}
	for ( var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
}
if (typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

$.isImg = function(src) {
	if (!src) {
		return false;
	}
	var suffix = src.replace(/.*\./, "").toLowerCase();
	var supports = [ "png", "bmp", "jpg", "jpeg" ];
	return supports.indexOf(suffix) >= 0;
}

$.isIp = function(ip) {
	var ips = ip.split(".");
	if (ips.length != 4) {
		return false;
	}
	for ( var i in ips) {
		var val = ips[i];
		var iv = parseInt(val);
		if (val != iv.toString()) {
			return false;
		}
		if (iv < 0) {
			return false;
		}
		if (iv > 255) {
			return false;
		}
	}
	return true;
}

$.isMac = function(mac) {
	var macs = mac.split(":");
	if (macs.length != 6) {
		return false;
	}
	for ( var i in macs) {
		var val = macs[i];
		var iv = parseInt(val, 16);
		if (val != iv.toString(16)) {
			return false;
		}
		if (iv < 0) {
			return false;
		}
		if (iv > 255) {
			return false;
		}
	}
	return true;
}
var oldCreateXhr = $.ajaxSettings.xhr;
$.ajaxSetup({
	type : "post",
	dataType : "json",
	cache : false,
	traditional : true,
	xhr : function() {
		var xhr = oldCreateXhr();
		if (xhr.upload) {
			$(".ajax-progress .progress-bar").css("width", "0%");
			xhr.upload.addEventListener("progress", function(evt) {
				var loaded = evt.loaded;
				var total = evt.total;
				var per = Math.floor(100 * loaded / total);
				$(".ajax-progress .progress-bar").css("width", per + "%");
				$doc.trigger("ajax-progress", [ per, loaded, total ]);
			}, false);
		}
		return xhr;
	},
	error : function(xhr, text, error) {
		if (xhr.status && xhr.status == 403) {
			if (window.top != window.self) {
				window.top.location.reload(true);
			}
		}
	},
	statusCode : {
		401 : function() {
			var exp = new Date(Date.now() - 1);
			document.cookie = "JSESSIONID=; expires=" + exp.toGMTString()
					+ "; path=/localsandbox";
		}
	}
});

$.visable = function($elm, callback) {
	if ($elm.is(":visible")) {
		callback();
		return;
	}
	var $parents = $elm.parents(":not(:visible)");
	$parents.each(function() {
		var $this = $(this);
		$this.attr("data-style", $this.attr("style"));
		$this.attr("data-class", $this.attr("class"));
		if ($this.hasClass("fade") && !$this.hasClass("in")) {
			$this.addClass("in");
		}
		$this.show();
	})
	callback();
	$parents.each(function() {
		var $this = $(this);
		$this.removeAttr("style");
		$this.removeAttr("class");
		$this.attr("style", $this.attr("data-style"));
		$this.attr("class", $this.attr("data-class"));
		$this.removeAttr("data-style");
		$this.removeAttr("data-class");
	})
};

$.formData2Json = function(form) {
	var data = new FormData(form);
	var json = {};
	var iter = data.keys();
	var cur;
	while (!(cur = iter.next()).done) {
		var val = data.getAll(cur.value);
		if (val.length == 0) {
			val = "";
		} else if (val.length == 1) {
			val = val[0];
		}
		json[cur.value] = val;
	}
	$(form).find(".ckeditor").each(function() {
		var $this = $(this);
		var id = $this.attr("id");
		var name = $this.attr("name");
		json[name] = CKEDITOR.instances[id].getData();
	});
	return json;
};

$.json2form = function(data, $target, trigger) {
	var elms = [];
	$target.find("[name],[data-name]").each(function() {
		var $this = $(this);
		var name = $this.attr("data-name");
		if (name == "") {
			return;
		}
		if (!name) {
			name = $this.attr("name");
		}
		if ($this.is(".pagination *")) {
			return;
		}
		var val = data[name];
		if ($this.is(":input")) {
			if ($this.is("[multiple]") && typeof val == "string") {
				val = val.split(",");
			}
			$this.val("");
			if (!$this.is(":file")) {
				$this.val(val);
			}
			if ($this.is(".ckeditor") && CKEDITOR) {
				CKEDITOR.instances[$this.attr("id")].setData(val);
			}
			if ($this.is("select")) {
				if (("" + $this.val()) != ("" + val)) {
					$this.find("option").each(function() {
						var $opt = $(this);
						if ($opt.text() == val) {
							$this.val($opt.val());
						}
					});
				}
			}
			if (trigger == false) {
				return;
			}
			if ($this.is("[data-trigger-immediately]")) {
				$this.trigger("change");
			} else {
				elms.push($this);
			}
		} else if ($this.is("img")) {
			$this.attr("src", val);
		} else if ($this.is("[data-format]")) {
			$this.html($.format($this.attr("data-format"), data));
		} else {
			$this.html($.safe(val));
		}
	});
	for ( var i in elms) {
		elms[i].trigger("change");
	}
};

$.format = function(str, json) {
	return str.replace(/\r?\n/g, " ").replace(/\$\{(.*?)\}/g, function($0, $1) {
		try {
			var s;
			with (json) {
				s = eval($1);
			}
			return s;
		} catch (e) {
			console.log(e);
		}
	});
}

$.safe = (function($DIV) {
	return function(str) {
		if (str == null) {
			return "";
		}
		var arr = (str + "").split(/\r?\n/g);
		for ( var i in arr) {
			arr[i] = $DIV.text(arr[i]).html();
		}
		return arr.join("<br/>");
	};
})($("<div>"));

$.pre = (function($DIV) {
	return function(str) {
		return $DIV.text(str).html() + '\n';
	};
})($("<div>"));

$.toHTML = (function($DIV) {
	return function(str) {
		if (str == null) {
			return "";
		}
		return $DIV.html(str).text();
	};
})($("<div>"));

var render = {
	ajax : {},
	table : {}
};

$doc.on("mousedown", ".btn[data-toggle='modal']", function(e) {
	if (e.button != 0) {
		return false;
	}
	var $btn = $(this);
	var $target = $($btn.attr("data-target") || $btn.attr("href"));
	var data = {};
	{
		var $bind = $btn.closest("[data-bind]");
		if ($bind.length) {
			$.extend(true, data, $bind.data("data"));
		}
	}
	{
		var $bind = $btn.closest("[data-table-ext]");
		if ($bind.length) {
			$.extend(true, data, $.formData2Json($bind[0]));
		}
	}
	if ($btn.is("[data-table-check]")) {
		var $wrap = $btn.closest(".table-wrap");
		var $table = $wrap.find("table[data-render]");
		var type = $btn.attr("data-table-check");

		var key = "";
		var val = [];
		var $checks = $table.find("tbody [data-table-check-" + type + "]");
		$checks.each(function() {
			var $check = $(this);
			if ($check.is(":checked")) {
				var value = $check.attr("data-table-check-" + type);
				val.push(value);
			}
			if (!key) {
				key = $check.attr("name");
			}
		});

		if (!val.length) {
			alert("请选择要删除的条目!");
			return false;
		}
		data[key] = val;
	}

	$target.find("select[data-render]").each(function() {
		var $this = $(this);
		$this.trigger("render." + this.tagName.toLowerCase(), data);
	});

	$.json2form(data, $target);

	$target.find("table[data-render]").each(function() {
		var $this = $(this);
		$this.attr("data-start", "0");
		$this.trigger("render." + this.tagName.toLowerCase());
	});
	$target.find("[data-topology]").each(function() {
		var $this = $(this);
		$this.data("data").load();
	});
});

$doc.on("submit", "form[data-url]", function() {
	var form = this;
	var $form = $(form);

	var errors = [];
	$form.find("[data-NotNull]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var val = $input.val();
		if (val == null || !val.length) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 不能为空!");
		}
	});
	$form.find("[data-Varchar]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var max = parseInt($this.attr("data-Varchar")) || 50;
		var val = $input.val();
		if (val && val.length > max) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 长度不能超过" + max + "字符!");
		}
	});
	$form.find("[data-Text]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var val = $input.val();
		if (val && val.length > 20000) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 长度不能超过20000字符!");
		}
	});
	$form.find("[data-Email]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var val = $input.val();
		if (val && !/^\w+@[\w.]+$/.test(val)) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 格式不正确!");
		}
	});
	$form.find("[data-IP]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var val = $input.val();
		if (val && !$.isIp(val)) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 格式不正确!");
		}
	});
	$form.find("[data-Words]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var val = $input.val();
		if (val && !/^\w+$/.test(val)) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 格式不正确!");
		}
	});
	$form.find("[data-Int]:visible").each(function() {
		var $this = $(this);
		var range = $this.attr("data-Int").split(",");
		var min = parseInt(range[0]) || 0;
		var max = parseInt(range[1]) || 99999;
		var $input = $this.find(":input");
		var val = $input.val();
		var intVal = parseInt(val);
		var name = $this.find("th").text().replace("：", "");
		if (!val) {
		} else if (!/^\d+$/.test(val)) {
			errors.push(name + " 必须为数字!");
		} else if (intVal < min) {
			errors.push(name + " 不能小于" + min + "!");
		} else if (intVal > max) {
			errors.push(name + " 不能大于" + max + "!");
		}
	});
	$form.find("[data-Ints]:visible").each(function() {
		var $this = $(this);
		var range = $this.attr("data-Ints").split(",");
		var min = parseInt(range[0]) || 0;
		var max = parseInt(range[1]) || 99999;
		var $input = $this.find(":input");
		var val = $input.val();
		var name = $this.find("th").text().replace("：", "");
		var errNan = false;
		var errMin = false;
		var errMax = false;
		val && val.split(",").map(function(e) {
			if (/^\d+$/.test(e)) {
				var intVal = parseInt(e);
				if (isNaN(intVal)) {
					errNan = true;
				} else if (intVal < min) {
					errMin = true;
				} else if (intVal > max) {
					errMax = true;
				} else {
					return intVal;
				}
			}
			return NaN;
		});
		if (!val) {
		} else {
			if (errNan) {
				errors.push(name + " 必须为以“,”分割的数字!");
			}
			if (errMin) {
				errors.push(name + " 不能小于" + min + "!");
			}
			if (errMax) {
				errors.push(name + " 不能大于" + max + "!");
			}
		}
	});

	$form.find("[data-Before]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var target = $this.attr("data-Before");
		var val = $input.val();
		var $form = $this.closest("form");
		var $target = $form.find("[name='" + target + "']");
		var $targetTr = $target.closest("tr")
		var targetValue = $target.val();
		if (val && val >= targetValue) {
			var name = $this.find("th").text().replace("：", "");
			var targetName = $targetTr.find("th").text().replace("：", "");
			errors.push(name + " 必须在 " + targetName + " 之前!");
		}
	});
	$form.find("[data-Lt]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var target = $this.attr("data-Lt");
		var val = parseFloat($input.val());
		var $form = $this.closest("form");
		var $target = $form.find("[name='" + target + "']");
		var $targetTr = $target.closest("tr")
		var targetValue = parseFloat($target.val());
		if ($input.val() && val >= targetValue) {
			var name = $this.find("th").text().replace("：", "");
			var targetName = $targetTr.find("th").text().replace("：", "");
			errors.push(name + " 必须比 " + targetName + " 小!");
		}
	});
	$form.find("[data-Suffix]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":file");
		var suffix = $this.attr("data-Suffix");
		var suffixes = suffix.split(",");
		var val = $input.val();
		var endsWith = false;
		if (val) {
			for ( var i in suffixes) {
				endsWith = val.endsWith(suffixes[i]);
				if (endsWith) {
					break;
				}
			}
		}
		if (val && !endsWith) {
			var name = $this.find("th").text().replace("：", "");
			errors.push(name + " 必须为" + suffix + "文件!");
		}
	});

	if (errors.length) {
		alert(errors.join("\r\n"));
		return false;
	}

	var days = {};
	$form.find("[data-CheckDay]:visible").each(function() {
		var $this = $(this);
		var $input = $this.find(":input");
		var val = $input.val();
		days[val.replace(/ .*/, "")] = 1;
	});
	if (Object.keys(days).length > 1) {
		if (!confirm("日期不在同一天内!确定保存吗？")) {
			return false;
		}
	}

	var expire = Date.now() - parseInt($form.attr("data-delay") || "0");
	if (expire < 1000) {
		return false;
	}
	$form.attr("data-delay", Date.now());

	if (!$form.attr("data-url")) {
		return true;
	}

	var path = $form.attr("data-path");
	if (path == null) {
		path = PATH;
	}
	var opts = {
		url : path + $form.attr("data-url"),
		type : $form.attr("data-type"),
		success : function(json) {
			if (render.ajax.check(json)) {
				$doc.find("[data-render]").each(function() {
					var $this = $(this);
					$this.trigger("render." + this.tagName.toLowerCase());
				});
				$doc.find("[data-form]").each(function() {
					var $this = $(this);
					$this.trigger("dataForm");
				});
				$form.find(".modal").modal("hide");
			}
		},
		error : function(code, text) {
			if (!code) {
				alert("文件过大");
			}
		}
	}
	if ($form.find("textarea,:file").length
			|| $form.is("[enctype='multipart/form-data']")) {
		$(form).find(".ckeditor").each(function() {
			var $this = $(this);
			var id = $this.attr("id");
			$this.val(CKEDITOR.instances[id].getData());
		});
		$.extend(true, opts, {
			data : new FormData(form),
			processData : false,
			contentType : false,
		});
	} else {
		opts.data = $.formData2Json(form);
		if (opts.type == "delete") {
			if (opts.url.indexOf("?") < 0) {
				opts.url += "?" + $.param(opts.data, true);
				opts.data = null;
			}
		}
	}

	var $div = $("<div>").css({
		position : "fixed",
		top : 0,
		left : 0,
		height : "100%",
		width : "100%",
		cursor : "wait",
	});
	var $top = $(window.top.document);
	$top.find("body:eq(0)").append($div);
	$.ajax(opts).done(function() {
		$form.trigger("ajaxSubmitted");
	}).always(function() {
		$div.remove();
	});
	return false;
});

$doc.on("render.table", "table[data-render]", function() {
	var $this = $(this);
	var $wrap = $this.closest(".table-wrap");
	var $pagination = $wrap.find(".pagination");
	var $search = $wrap.find(":input[name='search']");
	var $limit = $wrap.find("[data-limit]");
	var opts = eval("(" + $this.attr("data-render") + ")");

	$this.find("[data-table-check]").prop("checked", false);

	var columns = [];
	var order = null;
	var dir = "asc";
	$this.find("[data-item]").each(function() {
		var $this = $(this);
		var $template = $this.find("[data-template]");
		var item = eval("(" + ($this.attr("data-item") || "{}") + ")");
		if ($template.length) {
			item.render = (function($template) {
				var html = $template.html();

				return function(data, type, full) {
					return $.format(html, full);
				}
			})($template)
		} else {
			item.render = function(data, type, full) {
				return $.safe(data);
			};
		}
		if (!order) {
			if ($this.find("[class*='icon-chevron-']").length) {
				order = item.mData;
			}
		}
		if ($this.is(".order")) {
			order = item.mData;
			if ($this.find(".icon-chevron-down").length) {
				dir = "desc";
			}
		}
		columns.push(item);
	});

	var start = parseInt($this.attr("data-start")) || 0;
	var length = parseInt($limit.val()) || 10;
	var search = $search.val();
	var page = Math.floor(start / length) + 1;

	$pagination.find("[name='page']").val(page);

	opts.ajax = $.extend(true, render.table.ajaxData(start, length, search,
			order, dir), opts.ajax);

	var $ext = $wrap.find("[data-table-ext]");
	if ($ext.length) {
		var hasEmpty = false;
		$ext.find(":input[name]:not(:visible)").each(function() {
			var $this = $(this);
			if ($this.val() == "") {
				hasEmpty = true;
				return false;
			}
		});
		if (hasEmpty) {
			return;
		}
		var ext = $.formData2Json($ext[0]);
		$.extend(true, opts.ajax.data, ext);
	}

	var path = opts.path;
	if (path == null) {
		path = PATH;
	}

	opts.ajax.url = path + opts.ajax.url;
	$.ajax(opts.ajax).done(function(json) {
		var total = json[render.table.total];
		var pages = Math.ceil(total / length);
		if (page > pages && page > 1) {
			$this.attr("data-start", "0");
			$this.trigger("render.table");
			return;
		}
		$pagination.find("[data-page-total]").text(pages);

		$this.trigger("table.ajax", [ json ]);
		$.visable($this, function() {
			$this.DataTable({
				bAutoWidth : false,
				bFilter : false,
				bInfo : false,
				bPaginate : false,
				bProcessing : true,
				bSort : false,
				data : json[render.ajax.dataKey],
				aoColumns : columns,
				destroy : true,
				language : {
					zeroRecords : "没有数据",
				},
				fnRowCallback : function(node, data) {
					var $node = $(node);
					$node.attr("data-bind", true);
					$node.data("data", data);
				}
			});
		});
	});
	return false;
});
$doc.on("click", ".icon-chevron-down", function() {
	var $this = $(this);
	var $wrap = $this.parents(".table-wrap");
	var $table = $wrap.find(".dataTable:first");
	var $th = $this.parent("th");
	has = $th.is(".order");
	$table.find("th").removeClass("order");
	$table.find("th i").attr("class", "icon-chevron-up");
	if (has) {
		$this.attr("class", "icon-chevron-up");
	}
	$th.addClass("order");
	$table.trigger("render.table");
});
$doc.on("click", ".icon-chevron-up", function() {
	var $this = $(this);
	var $wrap = $this.parents(".table-wrap");
	var $table = $wrap.find(".dataTable:first");
	var $th = $this.parent("th");
	has = $th.is(".order");
	$table.find("th").removeClass("order");
	$table.find("th i").attr("class", "icon-chevron-up");
	if (has) {
		$this.attr("class", "icon-chevron-down");
	}
	$th.addClass("order");
	$table.trigger("render.table");
});
$doc.on("click", "[data-page]", function() {
	var $btn = $(this);
	var $wrap = $btn.closest(".table-wrap");
	var $limit = $wrap.find("[data-limit]");
	var $pagination = $wrap.find(".pagination");
	var $table = $wrap.find("table[data-render]");
	var $total = $pagination.find("[data-page-total]");

	var type = $btn.attr("data-page");
	var start = parseInt($table.attr("data-start")) || 0;
	var length = parseInt($limit.val()) || 10;
	var page = Math.ceil(start / length) + 1;
	var max = parseInt($total.text());

	if (type == "prev") {
		page--;
	} else if (type == "next") {
		page++;
	} else if (type == "goto") {
		var val = $pagination.find(":input[name='page']").val();
		page = parseInt(val) || 1;
	} else if (type = "search") {
	}
	if (page > max) {
		page = max;
	}
	if (!page || page < 1) {
		page = 1;
	}

	var pos = (page - 1) * length;
	$table.attr("data-start", pos);
	$table.trigger("render.table");
});
$doc.on("click", "[data-table-check='all']", function() {
	var $btn = $(this);
	var $wrap = $btn.closest(".table-wrap");
	var $table = $wrap.find("table[data-render]");
	var type = $btn.attr("data-table-check");

	var index = $btn.closest("th").index();
	var checked = $btn.is(":checked");
	$table.find("tr").each(function() {
		var $check = $(this).children(index).find(":checkbox");
		$check.prop("checked", checked);
	})
});
$doc.on("click", "[data-select-target]", function() {
	var $this = $(this);
	var $form = $this.closest("form");
	var target = $this.attr("data-select-target");
	var $target = $form.find("[name='" + target + "']");
	var data = [];
	if ($this.is(":checked")) {
		$target.find("option[value]:not([value=''])").each(function() {
			var $opt = $(this);
			data.push($opt.val());
		})
	}
	$target.val(data).trigger("change");
});

$doc.on("change", "[data-limit]", function() {
	var $btn = $(this);
	var $wrap = $btn.closest(".table-wrap");
	var $table = $wrap.find("table[data-render]");
	$table.trigger("render.table");
});

var SELECT_CACHE = {};
$doc.on("render.select", "select[data-render]", function(e, data) {
	var $this = $(this);
	$this.find(":not(option[value=''])").remove();
	var opts;
	try {
		opts = eval("(" + $this.attr("data-render") + ")");
	} catch (e) {
		return;
	}

	opts.ajax = $.extend(true, {
		url : "",
		data : {},
		type : "get",
		async : false
	}, opts.ajax);

	opts.ajax.url = PATH + opts.ajax.url;
	var u = opts.ajax.url + "?" + $.param(opts.ajax.data, true);
	var json = SELECT_CACHE[u];
	if (!json) {
		$.ajax(opts.ajax).done(function(json) {
			SELECT_CACHE[u] = json;
		});
		json = SELECT_CACHE[u];
	}
	if (!json) {
		return false;
	}

	var data = json[opts.data || render.ajax.dataKey];
	var key = opts.key || "id";
	var value = opts.value || "value";

	for ( var i in data) {
		var item = data[i];
		var text;
		if (value.startsWith("(")) {
			with (item) {
				text = eval(value);
			}
		} else {
			text = item[value];
		}
		$this.append($("<option>", {
			value : item[key],
			text : text
		}));
	}
	return false;
});
$doc.on("ajaxSubmitted", function() {
	SELECT_CACHE = {};
})

$doc.on("dataForm", "[data-form]", function() {
	var $this = $(this);
	var opts = eval("(" + $this.attr("data-form") + ")");

	opts.ajax = $.extend(true, {
		url : "",
		type : "get",
		async : false
	}, opts.ajax);

	opts.ajax.url = (opts.path == null ? PATH : opts.path) + opts.ajax.url;
	$.ajax(opts.ajax).done(function(json) {
		var data = json;
		if (opts.key) {
			if (opts.key.startsWith("(")) {
				with (json) {
					data = eval(opts.key);
				}
			} else {
				data = data[opts.key];
			}
		}

		$this.attr("data-bind", "").data("data", data);
		$.json2form(data, $this);
	});
});

function modalClose(elm) {
	$(elm).closest(".modal").data("bs.modal").hide()
}

var CK_CONFIG = {
	toolbar : [
			{
				name : 'document',
				items : [ 'Source', '-', 'NewPage', 'Preview', '-', 'Templates' ]
			},
			[ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-',
					'Undo', 'Redo' ], {
				name : 'basicstyles',
				items : [ 'Bold', 'Italic' ]
			} ],
	height : '140px',
	width : '218px'
}

$doc.find(".ckeditor").each(function() {
	var $this = $(this);
	var id = $this.attr("id");
	if (!id) {
		id = ("ck" + Math.random()).replace(/[^\w]/g, "");
		$this.attr("id", id);
	}
	CKEDITOR.replace(id, CK_CONFIG);
});

$doc.on("click", "#menu-nav a", function() {
	var $this = $(this);
	$("#menu-nav .active").removeClass("active");
	$this.addClass("active");
	$this.closest(".menu-group").addClass("active");
	$("#MainContent").attr("src", $this.attr("href"));
	return false;
});

$win.on("resize", function() {
	$("iframe").each(function() {
		var $iframe = $(this);
		var $curDoc = $(this.contentDocument);
		$iframe.css("min-height", 0);
		$iframe.css("min-height", $curDoc.outerHeight(true));
	});
})

$doc.on("hidden.bs.modal", function() {
	if ($(".modal.fade.in").length) {
		$("body").addClass("modal-open");
	}
});

$doc.on("draw.dt", "table", function() {
	var $this = $(this);
	var $big = $this.closest(".well.big");
	$big.css("min-height", window.parent.$win.height() - 200);
	var top = window.parent.$doc.scrollTop()
	window.parent.$win.trigger("resize");
	window.parent.$doc.scrollTop(top);
});

$doc.on("show.bs.modal", "[data-ajax]", function() {
	var $this = $(this);
	var opts = eval("(" + $this.attr("data-ajax") + ")");
	opts = $.extend({
		async : false,
		dataType : "json"
	}, opts);
	$.ajax(opts).done(function(json) {
		$.json2form(json[render.ajax.dataKey], $this);
	});
});

$doc.on("mousedown", "select[multiple] option", function(e) {
	if (e.button != 0) {
		return false;
	}
	var $this = $(this);
	var $select = $this.closest("select");
	if (!$select.is(":focus")) {
		$select.focus();
	}

	var arr = $select.val();
	var val = $this.val();
	var index = arr.indexOf(val);
	if (index < 0) {
		arr.push(val);
		if (e.shiftKey || e.ctrlKey) {
			$select.attr("data-select-drag", "add");
		} else {
			$select.attr("data-select-drag", null);
		}
	} else {
		arr.splice(index, 1);
		if (e.shiftKey || e.ctrlKey) {
			$select.attr("data-select-drag", "remove");
		} else {
			$select.attr("data-select-drag", null);
		}
	}
	$select.trigger("multiple-select", [ arr ]);
	return false;
});
$doc.on("mouseenter", "select[multiple][data-select-drag] option", function(e) {
	if (!e.shiftKey && !e.ctrlKey) {
		return;
	}
	var $this = $(this);
	var $select = $this.closest("select");
	var type = $select.attr("data-select-drag");

	var arr = $select.val();
	var val = $this.val();
	var index = arr.indexOf(val);
	if (type == "add") {
		if (index < 0) {
			arr.push(val);
			$this.trigger("multiple-select", [ arr ]);
		}
	} else if (type = "remove") {
		if (index >= 0) {
			arr.splice(index, 1);
			$this.trigger("multiple-select", [ arr ]);
		}
	}
});
$doc.on("mouseup", "select[multiple][data-select-drag]", function(e) {
	var $this = $(this);
	$this.removeAttr("data-select-drag");
});
$doc.on("multiple-select change", "select[multiple]", function(e, arr) {
	var $this = $(this);
	var top = $this.scrollTop();

	if (arr != null) {
		$this.val(arr);
		$this.trigger("change");
	}
	$this.children(".active").removeClass("active");
	$this.children(":selected").addClass("active");

	if ($this.is(".changing")) {
		return;
	}
	$this.addClass("changing");
	setTimeout(function() {
		if ($this.scrollTop() != top) {
			$this.scrollTop(top);
		}
		$this.removeClass("changing");
	})
});

$doc.on("click", "[data-form-action]", function() {
	var $this = $(this);
	var action = $this.attr("data-form-action");
	var $form = $("<form>", {
		method : "post",
		action : action,
	});
	$("body").append($form);
	$form.submit();
});

$(function() {
	setTimeout(function() {
		window.parent.$win.trigger("resize");
	}, 500)

	$doc.find(".Wdate:input").each(function() {
		var $this = $(this);
		var args = {
			skin : "whyGreen",
			dateFmt : "yyyy-MM-dd HH:mm:ss"
		};
		var fnc = "WdatePicker(" + JSON.stringify(args) + ")";
		$this.attr("onclick", fnc);
	});

	$doc.find("[data-render]").each(function() {
		var $this = $(this);
		$this.trigger("render." + this.tagName.toLowerCase());
	});

	$doc.find("[data-form]").each(function() {
		var $this = $(this);
		$this.trigger("dataForm");
	});

	if ($("#menu-nav").length) {
		$.ajax({
			url : "user/menu.json",
			type : "get",
			dataType : "json",
		}).done(function(json) {
			var cache = {};
			for ( var i in json.data) {
				var item = json.data[i];
				cache[item.id] = item;
				if (item.parentId == -1) {
					item.$elm = $("<div>", {
						"class" : "menu-group"
					});
					var $header = $("<div>", {
						"class" : "menu-header",
						text : item.name
					});

					item.$elm.append($header);
					item.$child = $("<div>", {
						"class" : "list-group"
					});
					item.$elm.append(item.$child);
				} else {
					item.$elm = $("<a>", {
						"class" : "list-group-item",
						href : item.url,
						text : item.name
					});
				}
			}
			cache["-1"] = {
				$child : $("#menu-nav")
			};
			for ( var i in json.data) {
				var item = json.data[i];
				var parent = cache[item.parentId];
				parent.$child.append(item.$elm);
			}
		});
	}

});